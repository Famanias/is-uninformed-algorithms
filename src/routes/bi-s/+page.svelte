<!-- BidirectionalSearchExample.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { bidirectionalSearch } from '$lib/uninformedAlgorithms';
  
    interface GraphNode {
      value: number;
      neighbors: GraphNode[];
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
  
      addEdge(from: number, to: number) {
        const fromNode = this.nodes.get(from);
        const toNode = this.nodes.get(to);
        if (fromNode && toNode) {
          fromNode.neighbors.push(toNode);
          toNode.neighbors.push(fromNode);
        }
      }
  
      toAlgorithmFormat(): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        this.nodes.forEach((node) => {
          result[node.value.toString()] = node.neighbors.map(n => n.value.toString());
        });
        return result;
      }
    }
  
    let graph: Graph;
    let traversalResult: { forwardPath: string[]; backwardPath: string[]; intersection: string } = { forwardPath: [], backwardPath: [], intersection: '' };
    let startNode: number = 1;
    let goalNode: number = 6;
    let forwardVisited: Set<number> = new Set();
    let backwardVisited: Set<number> = new Set();
  
    onMount(() => {
      graph = new Graph();
      graph.addNode(1, 200, 50);
      graph.addNode(2, 100, 150);
      graph.addNode(3, 300, 150);
      graph.addNode(4, 50, 250);
      graph.addNode(5, 150, 250);
      graph.addNode(6, 350, 250);
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(2, 5);
      graph.addEdge(3, 6);
    });
  
    function runBidirectionalSearch() {
      if (graph) {
        const graphFormat = graph.toAlgorithmFormat();
        const result = bidirectionalSearch(graphFormat, startNode.toString(), goalNode.toString());
        if (result) {
          traversalResult = result;
          forwardVisited = new Set(result.forwardPath.map(Number));
          backwardVisited = new Set(result.backwardPath.map(Number));
        } else {
          traversalResult = { forwardPath: [], backwardPath: [], intersection: '' };
          forwardVisited = new Set();
          backwardVisited = new Set();
        }
      }
    }
  
    function getEdgeCoords(from: GraphNode, to: GraphNode) {
      return { x1: from.x!, y1: from.y!, x2: to.x!, y2: to.y! };
    }
  </script>
  
  <svelte:head>
    <link rel="stylesheet" href="src/lib/styles.css" />
  </svelte:head>
  
  <main>
    <h1>Bidirectional Search Demo</h1>
    
    <div class="controls">
      <label>
        Start Node:
        <input type="number" min="1" max="6" bind:value={startNode}>
      </label>
      <label>
        Goal Node:
        <input type="number" min="1" max="6" bind:value={goalNode}>
      </label>
      <button on:click={runBidirectionalSearch}>Run Bidirectional Search</button>
    </div>
  
    <svg width="400" height="300">
      {#each Array.from(graph?.nodes ?? []) as [_, node]}
        {#each node.neighbors as neighbor}
          {@const coords = getEdgeCoords(node, neighbor)}
          <line x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} class="edge" />
        {/each}
      {/each}
      {#each Array.from(graph?.nodes ?? []) as [value, node]}
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          class:forward={forwardVisited.has(value) && !backwardVisited.has(value)}
          class:backward={backwardVisited.has(value) && !forwardVisited.has(value)}
          class:intersection={forwardVisited.has(value) && backwardVisited.has(value)}
          class:start={value === startNode}
          class:goal={value === goalNode}
        />
        <text x={node.x} y={node.y} text-anchor="middle" dominant-baseline="middle">{value}</text>
      {/each}
    </svg>
  
    <div class="results">
      <h2>Traversal Paths:</h2>
      {#if traversalResult.forwardPath.length > 0 && traversalResult.backwardPath.length > 0}
        <p>Forward Path: {traversalResult.forwardPath.join(' → ')}</p>
        <p>Backward Path: {traversalResult.backwardPath.join(' → ')}</p>
        <p>Intersection Node: {traversalResult.intersection}</p>
      {:else}
        <p>Click "Run Bidirectional Search" to see the traversal or no path exists</p>
      {/if}
    </div>
  </main>