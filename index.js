const express = require('express');
const { Ollama } = require('ollama');

const app = express();
const ollama = new Ollama();
app.use(express.json());

// --- BASE DE DATOS
let bancos = [
    { 
        id: 1, 
        banco: "Banco Popular Dominicano", 
        personas: [
            { id: 1, nombre: "Juan Pérez", saldo: 450000, consejoIA: "¡Usted es un duro! Siga invirtiendo esos cuartos." },
            { id: 2, nombre: "Miguelina Sosa", saldo: 25000, consejoIA: "Va por buen camino, mantenga el control." },
            { id: 3, nombre: "Pedro El Cojo", saldo: 150, consejoIA: "Mi hermano, usted necesita un préstamo de emergencia." }
        ] 
    },
    { 
        id: 2, 
        banco: "Banreservas", 
        personas: [
            { id: 1, nombre: "Roberto Pimentel", saldo: 85000, consejoIA: "Buen ahorro para las emergencias." },
            { id: 2, nombre: "Sandra Cuevas", saldo: 12000, consejoIA: "Cuidado con los gastos hormiga en el colmado." },
            { id: 3, nombre: "Doña Altagracia", saldo: 12, consejoIA: "¡Ay Virgen! A usted no le queda ni para un chicle." }
        ] 
    },
    { 
        id: 3, 
        banco: "Banco BHD", 
        personas: [
            { id: 1, nombre: "Ingeniero Guzmán", saldo: 1200000, consejoIA: "Ese capital está listo para bienes raíces." },
            { id: 2, nombre: "María García", saldo: 23500, consejoIA: "Ese saldo está para una cenita y ya." },
            { id: 3, nombre: "JuniorFlow", saldo: 500, consejoIA: "Menos chercha y más ahorro, que está en la línea." }
        ] 
    },
    { 
        id: 4, 
        banco: "Asociación Popular (APAP)", 
        personas: [
            { id: 1, nombre: "Don Manuel", saldo: 350000, consejoIA: "Usted duerme tranquilo con esos cuartos." },
            { id: 2, nombre: "Carlos Rodríguez", saldo: 5000, consejoIA: "Paso a paso se llena el jarro." },
            { id: 3, nombre: "Licenciada Méndez", saldo: 300, consejoIA: "A usted no le queda ni para el pasaje del carro público." }
        ] 
    },
    { 
        id: 5, 
        banco: "Scotiabank", 
        personas: [
            { id: 1, nombre: "Francis Rose", saldo: 950000, consejoIA: "Excellent wealth management." },
            { id: 2, nombre: "Luis Valdez", saldo: 45000, consejoIA: "Buen balance, siga así." },
            { id: 3, nombre: "José El Delivery", saldo: 50, consejoIA: "¡Oye! ¡Pero ni para un pica pollo le alcanza!" }
        ] 
    },
    { 
        id: 6, 
        banco: "Banco Santa Cruz", 
        personas: [
            { id: 1, nombre: "Héctor El Father", saldo: 700000, consejoIA: "Usted tiene la paca bien guardada." },
            { id: 2, nombre: "Ana Martínez", saldo: 15000, consejoIA: "Trate de ahorrar un chin más al mes." },
            { id: 3, nombre: "Wilson Piña", saldo: 0, consejoIA: "Saldo en cero. ¡Usted necesita un milagro o un empleo!" }
        ] 
    },
    { 
        id: 7, 
        banco: "Banco Promerica", 
        personas: [
            { id: 1, nombre: "Ricardo Arjona", saldo: 500000, consejoIA: "El problema no es el dinero, es que le sobra." },
            { id: 2, nombre: "Lucía Méndez", saldo: 30000, consejoIA: "Balance estable para el mes." },
            { id: 3, nombre: "El Tiguere", saldo: -100, consejoIA: "Usted lo que tiene es una deuda caminando." }
        ] 
    }
];

// --- RUTA POST: REGISTRAR PERSONA CON IA DOMINICANA ---
app.post('/banco/:id/personas', async (req, res) => {
    const banco = bancos.find(b => b.id === parseInt(req.params.id));
    if (!banco) return res.status(404).json({ error: "Banco no encontrado" });

    const { nombre, saldo } = req.body;
    console.log(`\n🤖 IA Analizando a: ${nombre} con RD$${saldo}`);

    try {
        const response = await ollama.chat({
            model: 'llama3.2:1b',
            messages: [
                { 
                    role: 'system', 
                    content: "Eres un asesor financiero dominicano. Si el saldo es alto, sé respetuoso y motivador. Si el saldo es bajísimo (menos de 500), sé gracioso y directo, dile que necesita un préstamo. Responde en una sola frase corta." 
                },
                { 
                    role: 'user', 
                    content: `Aconseja a ${nombre} con saldo RD$${saldo} en el ${banco.nombre}.` 
                }
            ],
            stream: false, 
        });

        const consejoIA = response.message.content.trim();
        const nuevaPersona = { id: banco.personas.length + 1, nombre, saldo: parseFloat(saldo), consejoIA };
        
        banco.personas.push(nuevaPersona);
        res.status(201).json({ mensaje: "Cliente registrado", datos: nuevaPersona });
    } catch (error) {
        res.status(500).json({ error: "Error de comunicación con Ollama" });
    }
});

// --- RUTA VIP: EL GANADOR DE RD ---
app.get('/analisis/vip', async (req, res) => {
    let todasLasPersonas = bancos.flatMap(b => b.personas);
    if (todasLasPersonas.length === 0) return res.status(404).json({ error: "Vacío" });

    const elDuro = todasLasPersonas.reduce((prev, curr) => (prev.saldo > curr.saldo) ? prev : curr);

    try {
        const response = await ollama.chat({
            model: 'llama3.2:1b',
            messages: [{ role: 'user', content: `Felicita a ${elDuro.nombre} por sus RD$${elDuro.saldo} al estilo dominicano millonario.` }],
            stream: false,
        });
        res.json({ ganador: elDuro.nombre, saldo: elDuro.saldo, consejoEspecial: response.message.content.trim() });
    } catch (e) {
        res.status(500).json({ error: "Error VIP" });
    }
});

app.get('/banco', (req, res) => res.json(bancos));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🏦 API BANCARIA LISTA - 21 Clientes cargados.`);
});