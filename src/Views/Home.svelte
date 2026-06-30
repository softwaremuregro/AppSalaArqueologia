<script>
  import Carrousel from "../Components/Carrousel.svelte";
  import CrearQR from "../Components/CrearQR.svelte";
  import Creditos from "../Components/Creditos.svelte";
  import NavBar from "../Components/NavBar.svelte";
  import Tarjeta from "../Components/Tarjeta.svelte";
  let modulos = [
    { texto: "Medio Ambiente y Cultura", imagen: "modulo1.png",posicion:"arriba" },
    { texto: "Desarrollos Culturales Antiguos", imagen: "modulo2.png",posicion:"arriba" },
    { texto: "El Clásico", imagen: "modulo3.png",posicion:"arriba" },
    { texto: "El Epiclásico", imagen: "modulo4.png",posicion:"arriba" },
    { texto: "ÚLTIMOS ASENTAMIENTOS PREHISPÁNICOS", imagen: "modulo5.png",posicion:"abajo" },
    { texto: "ÉPOCA DE CONTACTO", imagen: "modulo6.png",posicion:"abajo" },
    { texto: "DESARROLLOS LOCALES", imagen: "modulo7.png",posicion:"abajo" },
    { texto: "LA TÉCNICA Y LA CREATIVIDAD", imagen: "modulo8.png",posicion:"abajo" },
  ];
  let imgs = Array.from({length:6},(_,i)=>"/modulo1/"+(i+1)+".png");
</script>

<h1>Bienvenido a la Sala de Arqueología</h1>
<div class="container-fluid my-2">
 
  <div class="row">
    {#each modulos as item, index}
      <Tarjeta
        imagen={item.imagen}
        titulo={"Módulo " + (index + 1)}
        texto={item.texto.toUpperCase()}
        tamanio=3
        posicion={item.posicion}
        indice={index+1}
      ></Tarjeta>
    {/each}
  </div>
   <Creditos></Creditos>
</div>
