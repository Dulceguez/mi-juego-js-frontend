console.log("JS cargado correctamente");

let jugadorId = null;
let jugadores = []; //Lista de jugadores activos
let preguntas = []; //Lista de preguntas
let turnoActual = 0; //Para controlar de quien es el turno
let colorElegido = false;
const dadoImg = document.getElementById('dadoImg');

// --- Cargar preguntas desde JSON ---
fetch('./data/preguntas.json')
  .then(res => res.json())
  .then(data => {
    //se Mesclan aleatoriamente y se eligen 20
    preguntas = data.sort(() => 0.5 - Math.random()).slice(0, 21);
    console.log("Preguntas cargadas:", preguntas);
})
.catch(err => console.error("Error al cargar preguntas:", err));

let indicePregunta = 0; // lleva la cuenta de la pregunta actual

function obtenerPregunta() {
  if (!preguntas.length) return null; // evita error si no cargaron
  if (indicePregunta >= preguntas.length) indicePregunta = 0;
  return preguntas[indicePregunta++];
}

//  Tirar dado
const tirarDadoBtn = document.getElementById('tirarDado');
tirarDadoBtn.addEventListener('click', () => {
 //solo puedo tirar si es mi turno
  if (!jugadores.length || !jugadores[turnoActual]) { return;}
 
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
    // Mover al jugador actual
      jugadores[turnoActual].posicion += resultadoFinal;

      // Actualizar tablero y fichas
      actualizarFichas(jugadores);
      actualizarTablero();

      // Revisar ganador
      if (!revisarGanador()) {
        // Pasar al siguiente turno solo si no hay ganador
        siguienteTurno();
      }

      // Volver a habilitar el botón para el turno del siguiente jugador
      tirarDadoBtn.disabled = false;
      const pregunta = obtenerPregunta();
      mostrarPregunta(pregunta);
    }
  }, 100);

});

// --- Mostrar ficha y tablero ---
function actualizarFichas(jugadores) {
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

//  Mostrar pregunta
function mostrarPregunta(pregunta) {
  const contenedor = document.getElementById('preguntaContainer');
  contenedor.innerHTML = ''; //limpia la pregunta anterior
  if (!pregunta) {
    console.warn('Se intentó mostrar una pregunta nula');
    return;
  }
  const p = document.createElement('p');
  p.textContent = pregunta.texto;
  contenedor.appendChild(p);

  pregunta.respuestas.forEach((resp, idx) => {
    const btn = document.createElement('button');
    btn.textContent = resp.texto;
    btn.onclick = () => {
     if (resp.correcta) {
        alert("¡Respuesta correcta!");
        jugadores[turnoActual].posicion += 1; // ejemplo: avanzar 1 casilla
      } else {
        alert("Respuesta incorrecta.");
      }
      contenedor.innerHTML = ''; // Ocultar pregunta
      actualizarFichas(jugadores);
      siguienteTurno();
    };
    contenedor.appendChild(btn);
  });
}

// --- Selector de color y nombre ---
window.addEventListener('DOMContentLoaded', () => {
let nombre = "";
  while(!nombre.trim()){
    nombre = prompt("Ingresá tu nombre:");
  }

  const selector = document.getElementById('selectorColor');
  const botones = document.querySelectorAll('.color-btn');
  selector.style.display = 'flex';

  botones.forEach(btn => {
       btn.addEventListener('click', () => {
        const color = btn.dataset.color.toLowerCase();
        agregarJugador(nombre, color);
        selector.style.display = 'none';
        alert(`Jugador ${nombre} agregado con color ${color}`);
        actualizarFichas(jugadores);
      });
  });
});

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
  actualizarColores();
  actualizarTablero();
  alert(`Jugador ${nombre} agregado con color ${color}`);
}


function siguienteTurno() {
  turnoActual = (turnoActual + 1) % jugadores.length;
  alert(`Es el turno de ${jugadores[turnoActual].nombre}`);
}


// Actualzia el tablero y modifica las casillas segun la posicion de los jugadores
function actualizarTablero() {
  const tablero = document.getElementById('tablero');
  const casillaInicio = document.getElementById('casillaInicio');
  casillaInicio.querySelectorAll('.ficha').forEach(ficha => ficha.remove()); // limpio fichas en largada
 
  tablero.innerHTML = ''; // Limpiar tablero

  for (let i = 1; i < 21; i++) {
    const casilla = document.createElement('div');
    casilla.className = 'casilla';
    casilla.textContent = i;

    // Ver si hay algún jugador en esta casilla
    jugadores.forEach(j => {
      if (j.posicion === i) {
        const ficha = document.createElement('div');
        ficha.className = 'ficha';
        ficha.style.backgroundColor = j.color;
        ficha.title = j.nombre;
        ficha.textContent = (j.nombre && j.nombre.length > 0) ? j.nombre[0].toUpperCase() : '?';
        casilla.appendChild(ficha);
      }
    });

    tablero.appendChild(casilla);
  }
  // Poner las fichas de los jugadores que estén en la posición 0 (largada)
  jugadores.forEach(j => {
    if (j.posicion === 0) {
      const ficha = document.createElement('div');
      ficha.className = 'ficha';
      ficha.style.backgroundColor = j.color;
      ficha.title = j.nombre;
      ficha.textContent = (j.nombre && j.nombre.length > 0) ? j.nombre[0].toUpperCase() : '?';
      casillaInicio.appendChild(ficha);
    }
  });
}


function mostrarPregunta(pregunta) {
  const contenedor = document.getElementById('preguntaContainer');
  contenedor.innerHTML = '';
  if (!pregunta) return;

  const p = document.createElement('p');
  p.textContent = pregunta.texto;
  contenedor.appendChild(p);

  pregunta.respuestas.forEach(resp => {
    const btn = document.createElement('button');
    btn.textContent = resp.texto;
    btn.onclick = () => {
      if (resp.correcta) {
        alert("¡Respuesta correcta!");
        jugadores[turnoActual].posicion += 1; // avanzar 1 casilla si acierta
      } else {
        alert("Respuesta incorrecta.");
      }
      contenedor.innerHTML = '';
      actualizarFichas(jugadores);
      siguienteTurno();
    };
    contenedor.appendChild(btn);
  });
}

  // Avisar cuando un jugador gana
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