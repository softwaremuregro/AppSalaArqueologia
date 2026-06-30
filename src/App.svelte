<script>
  import Router from 'svelte-spa-router';
  import Home from './Views/Home.svelte';
  import Modulo1 from './Views/Modulo1.svelte';
  import Modulo2 from './Views/Modulo2.svelte';
  import Modulo3 from './Views/Modulo3.svelte';
  import Modulo4 from './Views/Modulo4.svelte';
  import Modulo5 from './Views/Modulo5.svelte';
  import Modulo6 from './Views/Modulo6.svelte';
  import Modulo7 from './Views/Modulo7.svelte';
  import Modulo8 from './Views/Modulo8.svelte';

  const routes = {
    '/': Home,
    '/modulo1': Modulo1,
    '/modulo2': Modulo2,
    '/modulo3': Modulo3,
    '/modulo4': Modulo4,
    '/modulo5': Modulo5,
    '/modulo6': Modulo6,
    '/modulo7': Modulo7,
    '/modulo8': Modulo8,
  };
</script>

<Router {routes} />
