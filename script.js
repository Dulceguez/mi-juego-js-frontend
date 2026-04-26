console.log("JS cargado correctamente");

let jugadores = []; //Lista de jugadores activos
let preguntas = []; //Lista de preguntas
let turnoActual = 0; //Para controlar de quien es el turno
let colorElegido = false;
let indicePregunta = 0; // lleva la cuenta de la pregunta actual
let preguntaPendiente = false;

const dadoImg = document.getElementById('dadoImg');
const tirarDadoBtn = document.getElementById('tirarDado');

//  -------------------- CARGAR PREGUNTAS --------------------
fetch('./data/preguntas.json')
  .then(res => res.json())
  .then(data => {
    //se Mezclan aleatoriamente y se eligen 20
    preguntas = data.sort(() => 0.5 - Math.random()).slice(0, 21);
    console.log("Preguntas cargadas:", preguntas);
})
.catch(err => console.error("Error al cargar preguntas:", err));


function obtenerPregunta() {
  if (!preguntas.length) return null; // evita error si no cargaron
  if (indicePregunta >= preguntas.length) indicePregunta = 0;
  return preguntas[indicePregunta++];
}

// -------------------- JUGADORES --------------------
window.addEventListener('DOMContentLoaded', () => {
  const nombre = pedirNombre();
  inicialSeleccionColor(nombre);
});

function pedirNombre() {
  let nombre;

  while (true) {
    nombre = prompt("Ingresá tu nombre:");

    if (nombre === null) {
      alert("Tenés que ingresar un nombre");
      continue;
    }

    nombre = nombre.trim();

    if (nombre !== "") {
      return nombre;
    }

    alert("El nombre no puede estar vacío");
  }
}

function inicialSeleccionColor(nombre) {
  const selector = document.getElementById('selectorColor');
  const botones = document.querySelectorAll('.color-btn');
 
  selector.style.display = 'flex';

  botones.forEach(btn => {
       btn.addEventListener('click', () => {
          const color = btn.dataset.color.toLowerCase();
          
          agregarJugador(nombre, color);
          selector.style.display = 'none';
          
          actualizarTablero();
          actualizarFichas();
      });
  });
}


function actualizarColores(){
  console.log('Jugadores:', jugadores);
  const coloresUsados = jugadores.map(j => j.color.toLowerCase());
  console.log('Colores usados:', coloresUsados);
  const botones = document.querySelectorAll('.color-btn');

  botones.forEach(btn => {
    const colorBtn = btn.dataset.color.toLowerCase();
    console.log(`Botón con color: ${colorBtn}, está usado: ${coloresUsados.includes(colorBtn)}`);
    
    if (coloresUsados.includes(colorBtn)) {
      btn.classList.add('bloqueado');
    } else {
      btn.classList.remove('bloqueado');
    }
  });
}

function agregarJugador(nombre, color) {
  jugadores.push({ nombre, color, posicion: 0 });
  actualizarFichas();
  actualizarTablero();
  alert(`Jugador ${nombre} agregado con color ${color}`);
}

//  -------------------- DADO --------------------
 
tirarDadoBtn.addEventListener('click', () => {
  if (preguntaPendiente) {
    alert("Tenés que responder la pregunta primero");
    return;
  } 

 //solo puedo tirar si es mi turno
  if (!jugadores.length || !jugadores[turnoActual])  return;
 
  tirarDadoBtn.disabled = true;

  let contador = 0;

  const intervalo = setInterval(() => {
    const numero = Math.floor(Math.random() * 6) + 1;
    dadoImg.src = `img/dado${numero}.png`;
    contador++;

    if (contador >= 10) {
      clearInterval(intervalo);

      const resultadoFinal = Math.floor(Math.random() * 6) + 1;
      dadoImg.src = `img/dado${resultadoFinal}.png`;

      // mover jugador
      jugadores[turnoActual].posicion += resultadoFinal;


      // Revisar ganador
      if (revisarGanador()) return;
      
      // mostrar pregunta

      const pregunta = obtenerPregunta();
      mostrarPregunta(pregunta);

      preguntaPendiente = true;
      tirarDadoBtn.disabled = true;
    }
  }, 100);

});

// ----------------------- PREGUNTAS --------------------
function mostrarPregunta(pregunta) {
  const contenedor = document.getElementById('preguntaContainer');
  contenedor.innerHTML = ''; //limpia la pregunta anterior

  if (!pregunta)  return;

  const p = document.createElement('p');
  p.textContent = pregunta.texto;
  contenedor.appendChild(p);

  pregunta.respuestas.forEach((resp) => {
    const btn = document.createElement('button');
    btn.textContent = resp.texto;

    btn.onclick = () => {
     if (resp.correcta) {
        alert("¡Respuesta correcta!");
        jugadores[turnoActual].posicion += 1; 
        actualizarFichas(jugadores);
        actualizarTablero();
      } else {
        alert("Respuesta incorrecta.");
      }
      preguntaPendiente = false;

      contenedor.innerHTML = ''; // Ocultar pregunta

      // verifico ganador
      if (revisarGanador()) return;

      // cambio turno
      siguienteTurno();

      // Volver a habilitar dado
      tirarDadoBtn.disabled = false;
    };

    contenedor.appendChild(btn);
  });
}



// -------------------- TURNOS --------------------
function siguienteTurno() {
  turnoActual = (turnoActual + 1) % jugadores.length;
  alert(`Es el turno de ${jugadores[turnoActual].nombre}`);
}


// -------------------- TABLERO --------------------
function actualizarFichas() {
  // Eliminar fichas anteriores para evitar duplicados
  document.querySelectorAll('.ficha').forEach(ficha => ficha.remove());

  jugadores.forEach(j => {
    const casilla = document.getElementById(`casilla-${j.posicion}`);
    if (casilla) {
      const ficha = document.createElement('div');
      ficha.classList.add('ficha');
      ficha.style.backgroundColor = j.color;
      ficha.textContent = j.nombre[0].toUpperCase();
      casilla.appendChild(ficha);
    }
  });
}

function actualizarTablero() {
  const tablero = document.getElementById('tablero'); 
  tablero.innerHTML = ''; // Limpiar tablero

  for (let i = 0; i < 21; i++) {
    const casilla = document.createElement('div');
    casilla.className = 'casilla';
    casilla.id = `casilla-${i}`;
    casilla.textContent = i;

    // Ver si hay algún jugador en esta casilla
    jugadores.forEach(j => {
      if (j.posicion === i) {
        const ficha = document.createElement('div');
        ficha.className = 'ficha';
        ficha.style.backgroundColor = j.color;
        ficha.textContent = (j.nombre && j.nombre.length > 0) ? j.nombre[0].toUpperCase() : '?';
        casilla.appendChild(ficha);
      }
    });

    tablero.appendChild(casilla);
  }
}

  // -------------------- GANADOR --------------------
 function revisarGanador() {
  const ganador = jugadores.find(j => j.posicion >= 20); // ejemplo: meta en casilla 20
  
  if (ganador) {
    alert(`${ganador.nombre} ganó la partida 🎉`);
    // Reiniciar juego o deshabilitar tablero
    tirarDadoBtn.disabled = true;
    return true;
  }
  return false;
}

  // Avisar cuando un jugador se desconecta 
 function eliminarJugador(nombre) {
  jugadores = jugadores.filter(j => j.nombre !== nombre);
  alert(`${nombre} se ha retirado del juego`);
  actualizarTablero();
  // Ajustar turnoActual si era el turno de este jugador
  if (turnoActual >= jugadores.length) turnoActual = 0;
}