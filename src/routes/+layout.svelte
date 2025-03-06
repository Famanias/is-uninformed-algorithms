<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation'; // SvelteKit navigation utility
  
	function navigateTo(path: string) {
	  goto(path);
	}
  </script>
  
  <svelte:head>
	<link rel="stylesheet" href="src/lib/styles.css" /> <!-- Assuming styles.css is in src/lib/ -->
  </svelte:head>
  
  <nav>
	<button on:click={() => navigateTo('/bfs')}>BFS</button>
	<button on:click={() => navigateTo('/dfs')}>DFS</button>
	<button on:click={() => navigateTo('/ucs')}>UCS</button>
	<button on:click={() => navigateTo('/dls')}>DLS</button>
	<button on:click={() => navigateTo('/iddfs')}>IDDFS</button>
	<button on:click={() => navigateTo('/bi-s')}>Bidirectional Search</button>
  </nav>
  
  <slot /> <!-- This renders the content of each route -->