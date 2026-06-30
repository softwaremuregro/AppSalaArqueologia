<script>
  import { onMount } from "svelte";
  // Si usas Bootstrap Icons, asegúrate de tenerlos instalados o importados en tu proyecto
  export let arreglo ="";
</script>

<nav class="navbar navbar-light bg-light {arreglo}  shadow-sm">
  <div class="container-fluid">
    <!-- Enlace de regresar -->
    <a class="navbar-brand d-flex align-items-center" href="#inicio">
      <!-- Icono flecha hacia atrás -->
      <i class="bi bi-arrow-left me-2"></i>
      Regresar
    </a>
  </div>
</nav>

