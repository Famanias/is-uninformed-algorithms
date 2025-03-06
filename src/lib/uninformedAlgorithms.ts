// Define GraphNode type
interface GraphNode {
  value: number;
  neighbors: GraphNode[];
}

// Define Graph type
interface Graph {
  nodes: Map<number, GraphNode>;
}

// Priority Queue for UCS
class PriorityQueue<T> {
	private items: { item: T; priority: number }[] = [];

	enqueue(item: T, priority: number): void {
		this.items.push({ item, priority });
		this.items.sort((a, b) => a.priority - b.priority);
	}
	dequeue(): T | undefined {
		return this.items.shift()?.item;
	}
	isEmpty(): boolean {
		return this.items.length === 0;
	}
}

// Breadth-First Search (BFS)
function bfs(graph: Record<string, string[]>, start: string, goal: string): string[] | null {
	let queue: [string, string[]][] = [[start, [start]]];
	let visited = new Set<string>();

	while (queue.length > 0) {
		let [node, path] = queue.shift()!;
		if (node === goal) return path;
		if (!visited.has(node)) {
			visited.add(node);
			for (let neighbor of graph[node] || []) {
				queue.push([neighbor, [...path, neighbor]]);
			}
		}
	}
	return null;
}

// Depth-First Search (DFS)
function dfs(graph: Record<string, string[]>, start: string, goal: string, path: string[] = [], visited = new Set<string>()): string[] | null {
	if (visited.has(start)) return null;
	visited.add(start);
	path.push(start);

	if (start === goal) return path;

	for (let neighbor of graph[start] || []) {
		let result = dfs(graph, neighbor, goal, [...path], visited);
		if (result) return result;
	}
	return null;
}

// Uniform Cost Search (UCS)
function ucs(graph: Record<string, [string, number][]>, start: string, goal: string): string[] | null {
	let pq = new PriorityQueue<[string, string[], number]>();
	pq.enqueue([start, [start], 0], 0);
	let visited = new Set<string>();

	while (!pq.isEmpty()) {
		let [node, path, cost] = pq.dequeue()!;
		if (node === goal) return path;

		if (!visited.has(node)) {
			visited.add(node);
			for (let [neighbor, weight] of graph[node] || []) {
				let newCost = cost + weight;
				pq.enqueue([neighbor, [...path, neighbor], newCost], newCost);
			}
		}
	}
	return null;
}

// Depth-Limited Search (DLS)
function dls(graph: Record<string, string[]>, start: string, goal: string, depthLimit: number, depth = 0): string[] | null {
	if (depth > depthLimit) return null;
	if (start === goal) return [start];

	for (let neighbor of graph[start] || []) {
		let result = dls(graph, neighbor, goal, depthLimit, depth + 1);
		if (result) return [start, ...result];
	}
	return null;
}

// Iterative Deepening Depth-First Search (IDDFS)
function iddfs(graph: Record<string, string[]>, start: string, goal: string, maxDepth: number): string[] | null {
	for (let depth = 0; depth <= maxDepth; depth++) {
		let result = dls(graph, start, goal, depth);
		if (result) return result;
	}
	return null;
}

// Bidirectional Search
function bidirectionalSearch(graph: Record<string, string[]>, start: string, goal: string): { forwardPath: string[]; backwardPath: string[]; intersection: string } | null {
	let forwardQueue: [string, string[]][] = [[start, [start]]];
	let backwardQueue: [string, string[]][] = [[goal, [goal]]];
	let forwardVisited = new Map<string, string>(); // node -> parent
	let backwardVisited = new Map<string, string>(); // node -> parent
	let intersection: string | null = null;

	if (start === goal) return { forwardPath: [start], backwardPath: [goal], intersection: start };

	forwardVisited.set(start, '');
	backwardVisited.set(goal, '');

	while (forwardQueue.length > 0 && backwardQueue.length > 0 && !intersection) {
		// Forward search step
		let [fNode, fPath] = forwardQueue.shift()!;
		for (let neighbor of graph[fNode] || []) {
			if (!forwardVisited.has(neighbor)) {
				forwardVisited.set(neighbor, fNode);
				forwardQueue.push([neighbor, [...fPath, neighbor]]);
				if (backwardVisited.has(neighbor)) {
					intersection = neighbor;
					break;
				}
			}
		}

		if (intersection) break;

		// Backward search step
		let [bNode, bPath] = backwardQueue.shift()!;
		for (let neighbor of graph[bNode] || []) {
			if (!backwardVisited.has(neighbor)) {
				backwardVisited.set(neighbor, bNode);
				backwardQueue.push([neighbor, [...bPath, neighbor]]);
				if (forwardVisited.has(neighbor)) {
					intersection = neighbor;
					break;
				}
			}
		}
	}

	if (!intersection) return null;

	// Reconstruct forward path
	const forwardPath: string[] = [];
	let current = intersection;
	while (current) {
		forwardPath.unshift(current);
		current = forwardVisited.get(current)!;
		if (!current) break;
	}

	// Reconstruct backward path
	const backwardPath: string[] = [];
	current = intersection;
	while (current) {
		backwardPath.push(current);
		current = backwardVisited.get(current)!;
		if (!current) break;
	}

	return { forwardPath, backwardPath, intersection };
}

export { bfs, dfs, dls, ucs, iddfs, bidirectionalSearch };
