const recipients = [
    {
        nickname: "los árabes",
        reason: "por haber inventado el Truco" 
    },
    {
        nickname: "Gardel",
        reason: "por su participación especial" 
    },
    {
        nickname: "mi esposa Andrea",
        reason: "por bancarme"
    },
    {
        nickname: "CoderHouse",
        reason: "por sus cursos y profesores"
    }
] 

window.onload = () => {
    try {
        let didThank = localStorage.getItem("didThank")
        if (didThank != 1) {
            let users = []
            fetch("https://jsonplaceholder.typicode.com/users")
            .then(response => response.json())
            .then(data => {
                data.forEach((user, i) => {
                    if (i < recipients.length){
                        users.push(recipients[i])
                    }                          
                    /* sobrescribo los users de la api porque cuando quise usar un json local me daba errores de CORS el navegador.
                    No se usar node para correr la aplicación en un puerto específico y tratar de evitar ese error. Además 
                    supongo que si usaba node tal vez traería problemas de compativilidad de versiones o con sus paquetes */
                })
            })

            let message = recipients.reduce((acc, curr) => {
                return acc + `${curr.nickname} ${curr.reason}, `
            }, "").slice(0, -2)

            Swal.fire({
                title: "Agradecimientos especiales a:",
                text: message,
            })
        }
        
    } catch (error) {
        localStorage.setItem("didThank", 1)
        Swal.fire({
            title: "Uhh se pudrió todo!",
            icon: "error",
            text: "Le pedimos disculpas ocurrió un error :(",
            confirmButtonText: "Reiniciar juego"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "../index.html"
            }
        })
    } finally {
        localStorage.setItem("didThank", 1)
    }
}