<script lang="ts">
  import { link } from "svelte-spa-router";

  export let imagen;
  export let titulo;
  export let texto;
  export let tamanio;
  export let posicion;
  export let indice;
</script>

<div class="col-sm-12 col-md-6 col-lg-{tamanio}  mb-4">
  <a href={`/modulo${indice}`} use:link>
    <div class="card">
      {#if posicion === "arriba"}
        <img src={"images/portadas/" + imagen} class="card-img-top" alt="..." />
      {/if}
      <div class="card-body text-bg-dark ">
        <h5 class="card-title">{titulo}</h5>
        {#if texto}
                <p class="card-text">{texto}</p>
        {/if}
        <!-- <div class="d-grid gap-2">
      <a href="/" class="btn btn-info btn-lg">Ver Información</a></div> -->
      </div>
      {#if posicion === "abajo"}
        <img src={"images/portadas/" + imagen} class="card-img-bottom" alt="..." />
      {/if}
    </div>
  </a>
</div>

<style>
  a {
    text-decoration: none;
  }
  a:hover .card {
    box-shadow: 0 10px 20px green;
    /* (Opcional) Un ligero escalamiento para una mejor indicación visual */
    transform: translateY(-5px);
  }
  .card {
    transition:
      box-shadow 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }
  img {
    max-height: 350px;
  }
</style>
