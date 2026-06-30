<script lang="ts">
  export let imagenes;
  export let indice;
</script>
<div class="container" style="margin-bottom: 100px;">
<div id={"carouselExample"+indice} style="height: 400px; width:800px;" class="carousel slide">
  <div class="carousel-indicators">
    {#each imagenes as imagen, i }
      <button type="button" data-bs-target={"#carouselExample"+indice} data-bs-slide-to={i} class={i === 0 ? 'active' : ''} aria-current="true" aria-label={"Slide "+i}></button>
    {/each}
  </div>
  <div class="carousel-inner">
    {#each imagenes as imagen,i}
      <div class="carousel-item {i === 0 ? 'active' : ''}">
        <img src={"images/"+imagen} style="height: 400px;" class="d-block w-100" alt="..." />
      </div>
    {/each}
  </div>
  <button
    class="carousel-control-prev"
    type="button"
    data-bs-target={"#carouselExample"+indice}
    data-bs-slide="prev"
  >
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button
    class="carousel-control-next"
    type="button"
    data-bs-target={"#carouselExample"+indice}
    data-bs-slide="next"
  >
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>
</div>

<style>
  .carousel-control-prev-icon, .carousel-control-next-icon{
    background-color: black;
    border-radius: 100%;
    width: 50px;
    height: 50px;
  }
  .carousel-indicators>button{
    background-color: black;
  }
</style>