                const clientes = [
                { nombre: "Ana", consumos: [120, 80, 50], descuento: 0.10 },
                { nombre: "Luis", consumos: [200, 150], descuento: 0.15 },
                { nombre: "Marta", consumos: [90, 60, 40], descuento: 0.05 }
                ];

                function calcularSubtotal(consumos) {
                let subtotal = 0;

                for (let i = 0; i < consumos.length; i++) {
                    subtotal += consumos[i];
                }

                return subtotal;
                }

                function aplicarDescuento(subtotal, descuento) {
                return subtotal - subtotal * descuento;
                }

                function calcularCuenta(cliente) {
                const subtotal = calcularSubtotal(cliente.consumos);
                const total = aplicarDescuento(subtotal, cliente.descuento);

                return {
                    nombre: cliente.nombre,
                    subtotal: subtotal,
                    descuento: cliente.descuento,
                    total: total
                };
                }

                for (let i = 0; i < clientes.length; i++) {
                const cuenta = calcularCuenta(clientes[i]);

                console.log(
                    cuenta.nombre +
                    " | Subtotal: $" +
                    cuenta.subtotal.toFixed(2) +
                    " | Descuento: " +
                    cuenta.descuento * 100 +
                    "% | Total: $" +
                    cuenta.total.toFixed(2)
                );
                }