<!-- UCSExample.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { ucs } from '$lib/uninformedAlgorithms';
  
    interface GraphNode {
      value: number;
      neighbors: { node: GraphNode; cost: number }[];
      x?: number;
      y?: number;
    }
  
    class Graph {
      nodes: Map<number, GraphNode>;
  
      constructor() {
        this.nodes = new Map();
      }
  
      addNode(value: number, x: number, y: number): GraphNode {
        const node = { value, neighbors: [], x, y };
        this.nodes.set(value, node);
        return node;
      }
  
      addEdge(from: number, to: number, cost: number) {
        const fromNode = this.nodes.get(from);
        const toNode = this.nodes.get(to);
        if (fromNode && toNode) {
          fromNode.neighbors.push({ node: toNode, cost });
        }
      }
  
      toAlgorithmFormat(): Record<string, [string, number][]> {
        const result: Record<string, [string, number][]> = {};
        this.nodes.forEach((node) => {
          result[node.value.toString()] = node.neighbors.map(n => [n.node.value.toString(), n.cost]);
        });
        return result;
      }
    }
  
    let graph: Graph;
    let traversalResult: { path: number[]; totalCost: number } = { path: [], totalCost: 0 };
    let startNode: number = 1;
    let goalNode: number = 6;
    let visitedNodes: Set<number> = new Set();
  
    onMount(() => {
      graph = new Graph();
      graph.addNode(1, 200, 50);
      graph.addNode(2, 100, 150);
      graph.addNode(3, 300, 150);
      graph.addNode(4, 50, 250);
      graph.addNode(5, 150, 250);
      graph.addNode(6, 350, 250);
      graph.addEdge(1, 2, 4);
      graph.addEdge(1, 3, 8);
      graph.addEdge(2, 4, 2);
      graph.addEdge(2, 5, 5);
      graph.addEdge(3, 6, 3);
    });
  
    function runUCS() {
      if (graph) {
        const graphFormat = graph.toAlgorithmFormat();
        const result = ucs(graphFormat, startNode.toString(), goalNode.toString());
        if (result) {
          const path = result.map(Number);
          let totalCost = 0;
          for (let i = 0; i < path.length - 1; i++) {
            const fromNode = graph.nodes.get(path[i])!;
            const toValue = path[i + 1];
            const edge = fromNode.neighbors.find(n => n.node.value === toValue);
            if (edge) totalCost += edge.cost;
          }
          traversalResult = { path, totalCost };
        } else {
          const visited = new Set<string>();
          const costs = new Map<string, number>();
          const queue: [number, string][] = [[0, startNode.toString()]];
          const path: string[] = [];
          costs.set(startNode.toString(), 0);
          while (queue.length > 0) {
            queue.sort((a, b) => a[0] - b[0]);
            const [currentCost, current] = queue.shift()!;
            if (!visited.has(current)) {
              visited.add(current);
              path.push(current);
              for (const [neighbor, cost] of graphFormat[current] || []) {
                if (!visited.has(neighbor)) {
                  const newCost = currentCost + cost;
                  const existingCost = costs.get(neighbor);
                  if (existingCost === undefined || newCost < existingCost) {
                    costs.set(neighbor, newCost);
                    queue.push([newCost, neighbor]);
                  }
                }
              }
            }
          }
          const fullPath = path.map(Number);
          const totalCost = costs.get(fullPath[fullPath.length - 1].toString()) || 0;
          traversalResult = { path: fullPath, totalCost };
        }
        visitedNodes = new Set(traversalResult.path);
      }
    }
  
    function getEdgeCoords(from: GraphNode, toValue: number) {
      const toNode = graph.nodes.get(toValue)!;
      return {
        x1: from.x!,
        y1: from.y!,
        x2: toNode.x!,
        y2: toNode.y!,
        cost: from.neighbors.find(n => n.node.value === toValue)?.cost
      };
    }
  </script>
  
  <svelte:head>
    <link rel="stylesheet" href="src/lib/styles.css" />
  </svelte:head>
  
  <main>
    <h1>Uniform Cost Search Demo</h1>
    
    <div class="controls">
      <label>
        Start Node:
        <input type="number" min="1" max="6" bind:value={startNode}>
      </label>
      <label>
        Goal Node:
        <input type="number" min="1" max="6" bind:value={goalNode}>
      </label>
      <button on:click={runUCS}>Run UCS</button>
    </div>
  
    <svg width="400" height="300">
      {#each Array.from(graph?.nodes ?? []) as [_, node]}
        {#each node.neighbors as neighbor}
          {@const coords = getEdgeCoords(node, neighbor.node.value)}
          <line x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} class="edge" />
          <text x={(coords.x1 + coords.x2) / 2} y={(coords.y1 + coords.y2) / 2} class="cost-label">{coords.cost}</text>
        {/each}
      {/each}
      {#each Array.from(graph?.nodes ?? []) as [value, node]}
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          class:visited={visitedNodes.has(value)}
          class:start={value === startNode}
          class:goal={value === goalNode}
        />
        <text x={node.x} y={node.y} text-anchor="middle" dominant-baseline="middle">{value}</text>
      {/each}
    </svg>
  
    <div class="results">
      <h2>Traversal Order:</h2>
      {#if traversalResult.path.length > 0}
        <p>{traversalResult.path.join(' → ')}</p>
        <p>Total Cost: {traversalResult.totalCost}</p>
      {:else}
        <p>Click "Run UCS" to see the traversal</p>
      {/if}
    </div>
  </main>