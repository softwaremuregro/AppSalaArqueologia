<script lang="ts">
  import { onDestroy } from 'svelte'; // Importamos el ciclo de vida
  import Carrousel from "./Carrousel.svelte";
  import { currentAudio } from "../scripts/audioStore.js"; 
  import CrearQR from './CrearQR.svelte';

  export let titulo, texto, imagenes, indice, id, audio,link,mostrar;
  let audioRef;

  function manejarReproduccion() {
    currentAudio.update(audioGlobal => {
      if (audioGlobal && audioGlobal !== audioRef) {
        audioGlobal.pause();
        audioGlobal.currentTime = 0;
      }
      return audioRef;
    });
  }

  // --- ESTA ES LA PARTE NUEVA ---
  onDestroy(() => {
    // Cuando el componente se destruye (el usuario cambia de vista)
    currentAudio.update(audioGlobal => {
      // Si el audio que está sonando es el de ESTA página, lo pausamos
      if (audioGlobal === audioRef) {
        audioGlobal.pause();
        return null; // Limpiamos el store
      }
      return audioGlobal; // Si es otro, lo dejamos tranquilo
    });
  });
</script>

<h1 id={id}>{titulo}</h1>
{#if audio}
    <audio 
  src={"audios/" + audio} 
  controls 
  bind:this={audioRef}
  on:play={manejarReproduccion}
></audio>
{/if}


{#if texto}
    <p>{texto}</p>
{/if}
{#if imagenes.length>1}
    <Carrousel imagenes={imagenes} indice={indice}></Carrousel>
{:else} 
    {#if imagenes.length===1}
    <img style="margin-bottom: 100px;" height="400" src={"images/"+imagenes[0]} alt="">
    {/if}
{/if}
{#if mostrar}
<CrearQR url={link}></CrearQR>
{/if}
<style>
    p{
        font-size: 18px;
    }
</style>