<script>
  import QRCode from 'qrcode';

  export let url = ""; // Propiedad que recibe el enlace

  // Generamos una promesa que Svelte resolverá automáticamente
  $: qrPromise = url ? QRCode.toDataURL(url, { width: 300 }) : null;
</script>
<h1>Escanea el codigo Qr Para conocer Más</h1>
{#if url}
  {#await qrPromise}
    <p>Generando...</p>
  {:then src}
    <img {src} alt="Código QR para {url}" />
  {:catch error}
    <p style="color: red;">{error.message}</p>
  {/await}
{:else}
  <p>Esperando enlace...</p>
{/if}