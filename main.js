// ====== Datos de las cuentas (arreglo de objetos) ======
let cuentas = [
  { nombre: "Mali", saldo: 200, password: "1234", dni: 44788834 },
  { nombre: "Gera", saldo: 150, password: "5678", dni: 10247439 },
  { nombre: "Sabi", saldo: 60,  password: "9102", dni: 98005362 }
];

// ====== Estado de la aplicacion ======
let cuentaSeleccionada = null; // indice en el arreglo
let operacionActual = null;    // 'ingresar' | 'retirar'

// ====== Utilidades ======
function money(n){ return "$" + Number(n).toFixed(2); }

function mostrarVista(id, titulo){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (titulo) document.getElementById('screenTitle').textContent = titulo;
}

function mostrarMensaje(elId, texto, tipo){
  const el = document.getElementById(elId);
  el.textContent = texto;
  el.className = 'msg show ' + tipo;
}
function limpiarMensaje(elId){
  const el = document.getElementById(elId);
  el.textContent = '';
  el.className = 'msg';
}

// ====== Reloj de pantalla ======
function actualizarReloj(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  document.getElementById('clock').textContent = hh + ':' + mm;
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

// ====== 1) Pintar lista de cuentas ======
function pintarCuentas(){
  const cont = document.getElementById('accountList');
  cont.innerHTML = '';
  cuentas.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'atm-btn';
    btn.innerHTML = '<span>' + c.nombre + '</span>' +
                    '<span class="sub">DNI: ' + c.dni + '</span>';
    btn.onclick = () => seleccionarCuenta(i);
    cont.appendChild(btn);
  });
}

function seleccionarCuenta(i){
  cuentaSeleccionada = i;
  document.getElementById('pwdUser').textContent = cuentas[i].nombre;
  document.getElementById('pwdInput').value = '';
  limpiarMensaje('pwdMsg');
  mostrarVista('view-password', 'Autenticacion');
  document.getElementById('pwdInput').focus();
}

function volverCuentas(){
  cuentaSeleccionada = null;
  mostrarVista('view-accounts', 'Bienvenido');
}

// ====== 2) Validacion de password (permite reintentar) ======
function validarPassword(){
  const ingreso = document.getElementById('pwdInput').value.trim();
  const cuenta = cuentas[cuentaSeleccionada];

  if (ingreso === ''){
    mostrarMensaje('pwdMsg', 'Debes ingresar tu clave de 4 digitos.', 'error');
    return;
  }
  if (ingreso !== cuenta.password){
    // Password incorrecto: se notifica y se permite intentar nuevamente
    mostrarMensaje('pwdMsg', 'Clave incorrecta. Vuelve a intentarlo.', 'error');
    document.getElementById('pwdInput').value = '';
    document.getElementById('pwdInput').focus();
    return;
  }
  // Password correcto -> menu de opciones
  limpiarMensaje('pwdMsg');
  irMenu();
}

// ====== Menu principal ======
function irMenu(){
  const cuenta = cuentas[cuentaSeleccionada];
  document.getElementById('menuUser').textContent = cuenta.nombre;
  limpiarMensaje('opMsg');
  mostrarVista('view-menu', 'Menu principal');
}

function cerrarSesion(){
  cuentaSeleccionada = null;
  operacionActual = null;
  mostrarVista('view-accounts', 'Bienvenido');
}

// ====== Opcion 1: Consultar saldo ======
function irConsultar(){
  const cuenta = cuentas[cuentaSeleccionada];
  document.getElementById('saldoUser').textContent = 'Titular: ' + cuenta.nombre;
  document.getElementById('saldoValue').textContent = money(cuenta.saldo);
  mostrarVista('view-saldo', 'Consultar saldo');
}

// ====== Opciones 2 y 3: Ingresar / Retirar monto ======
function irOperacion(tipo){
  operacionActual = tipo;
  const input = document.getElementById('opInput');
  input.value = '';
  limpiarMensaje('opMsg');
  if (tipo === 'ingresar'){
    document.getElementById('opTitle').textContent = 'Ingresar monto a la cuenta';
    document.getElementById('opLabel').textContent = 'Monto a ingresar ($)';
    mostrarVista('view-operacion', 'Ingresar monto');
  } else {
    document.getElementById('opTitle').textContent = 'Retirar monto de la cuenta';
    document.getElementById('opLabel').textContent = 'Monto a retirar ($)';
    mostrarVista('view-operacion', 'Retirar monto');
  }
  input.focus();
}

function confirmarOperacion(){
  const cuenta = cuentas[cuentaSeleccionada];
  const monto = parseFloat(document.getElementById('opInput').value);

  // Validaciones generales
  if (isNaN(monto) || document.getElementById('opInput').value.trim() === ''){
    mostrarMensaje('opMsg', 'Ingresa un monto valido.', 'error');
    return;
  }
  if (monto <= 0){
    mostrarMensaje('opMsg', 'El monto debe ser mayor a $0.', 'error');
    return;
  }

  if (operacionActual === 'ingresar'){
    cuenta.saldo += monto;
    mostrarResultado('Deposito realizado', 'Monto ingresado: ' + money(monto), cuenta.saldo);
  } else { // retirar
    // Regla de negocio: la cuenta no puede quedar por debajo de $0
    if (monto > cuenta.saldo){
      mostrarMensaje('opMsg', 'Fondos insuficientes. Tu saldo es ' + money(cuenta.saldo) + '. No puedes retirar ese monto.', 'error');
      return;
    }
    cuenta.saldo -= monto;
    mostrarResultado('Retiro realizado', 'Monto retirado: ' + money(monto), cuenta.saldo);
  }
}

function mostrarResultado(titulo, detalle, nuevoSaldo){
  document.getElementById('resTitle').textContent = titulo;
  document.getElementById('resDetail').textContent = detalle;
  document.getElementById('resSaldo').textContent = money(nuevoSaldo);
  mostrarVista('view-result', titulo);
}

// ====== Teclado fisico (actua sobre el input activo) ======
function inputActivo(){
  if (document.getElementById('view-password').classList.contains('active'))
    return document.getElementById('pwdInput');
  if (document.getElementById('view-operacion').classList.contains('active'))
    return document.getElementById('opInput');
  return null;
}
function tecla(num){
  const inp = inputActivo();
  if (!inp) return;
  if (inp.id === 'pwdInput' && inp.value.length >= 4) return;
  inp.value += num;
}
function teclaBorrar(){
  const inp = inputActivo();
  if (!inp) return;
  inp.value = inp.value.slice(0, -1);
}
function teclaEnter(){
  if (document.getElementById('view-password').classList.contains('active')) validarPassword();
  else if (document.getElementById('view-operacion').classList.contains('active')) confirmarOperacion();
}

// Permitir Enter con el teclado real
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') teclaEnter();
});

// ====== Inicio ======
pintarCuentas();