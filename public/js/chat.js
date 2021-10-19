let usuario = null;
let socket  = null;

//Referencias HTML
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const uLusuarios = document.querySelector('#usuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');

let url = (window.location.hostname.includes('localhost')) ?
'http://localhost:8082/api/auth/' :
'https://rest-server-mijitaos106.herokuapp.com/api/auth/';

//valida el token del localstorage
const validarJWT = async() =>{

    const token = localStorage.getItem('token') || "";

    if(token.length <= 10){
        window.location = "index.html";
        throw new Error('No hay token en el servidor');
    }

    const res = await fetch(url,{
        headers:{'x-token': token}
    });

    const {usuario: userDB,token:tokenDB} = await res.json();
    localStorage.setItem('token',tokenDB);
    console.log(userDB,tokenDB);
    usuario = userDB;
    document.title = usuario.nombre;
    await conectarSocket();
};

const conectarSocket = async() => {
    
     socket = io({
        'extraHeaders':{
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect',() =>{
        console.log('sockets online');
    }),
    socket.on('disconnect',() =>{
        console.log('Desconexion');
    });

    socket.on('recibir-mensajes',dibujarMensajes);

    socket.on('usuarios-activos',dibujarUsuarios);
    
    socket.on('mensaje-privado',(payload) =>{
        //Recibir Mensajes Privados
        console.log("privado", payload);
    });
};

const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = "";
    usuarios.forEach(({nombre,uid}) => {
        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success">${nombre}</h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;
    });

    uLusuarios.innerHTML = usersHtml;

};

txtMensaje.addEventListener('keyup',({keyCode}) =>{

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    if(keyCode !== 13){return;};

    if(mensaje.length === 0){return;}

    socket.emit('enviar-mensaje', {mensaje,uid});

    txtMensaje.value = '';
});

const dibujarMensajes = (mensajesArr = []) => {

    let mensajes = "";
    mensajesArr.forEach(({nombre,mensaje}) => {
        mensajes += `
            <li>
                <p>
                    <span class="text-primary"><b>${nombre}</b></span>
                    <span>${mensaje}</span>
                </p>
            </li>
        `;
    });

    ulMensajes.innerHTML = mensajes;

};

const main = async() => {

    //Validar JWT
    await validarJWT();

};

main();

