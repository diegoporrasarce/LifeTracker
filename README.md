# LifeTracker

App móvil para llevar el control de tu vida con [Expo](https://expo.dev) y [Expo Go](https://expo.dev/go). Todo se guarda **solo en el dispositivo** (AsyncStorage), sin cuentas, sin servidores y sin información personal.

## Funcionalidades

- **Tareas** — pendientes, agrupadas por vencimiento, con prioridad, fecha y notas.
- **Calendario** — registra lo que has hecho (`Hecho`) y lo que te toca (`Me toca`). También muestra las tareas sin completar.
- **Cartera** — cuentas bancarias y brókeres. Separa **dinero en cartera (efectivo)** e **invertido** por mes, con evolución mensual y gráfico apilado.
- **Gastos fijos** — importe mensual, categoría, día de cobro, totales anuales y cuánto queda tras estimar ingresos.
- **Deudas** — `Me deben` / `Yo debo`, en **dinero** o **sin cantidad** (cosas como un gorro o un libro). Se pueden marcar como saldadas.
- **Ajustes** — ingresos mensuales, **exportar/importar copia JSON** (compartir/pegar), cargar datos de ejemplo o borrar todo. Aviso de privacidad.

## Tecnologías

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) + [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native 0.86](https://reactnative.dev/) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)
- [react-native-svg](https://github.com/software-mansion/react-native-svg) para el gráfico de cartera

## Requisitos

- [Node.js](https://nodejs.org/) LTS (el proyecto se ha probado con Node 20; Expo CLI avisa si la versión es muy antigua)
- [Expo Go](https://expo.dev/go) en Android/iOS, o un emulador/simulador

## Ejecutar en local

```bash
npm install
npx expo start
```

Escanea el QR con **Expo Go** (Android) o con la app Cámara (iOS).

## Privacidad

**No contiene datos personales.** Toda la información que añadas permanece en tu dispositivo. La función "Exportar" solo comparte el JSON que tú decidas con la app que elijas.

## Notas

- Las fechas se guardan como `YYYY-MM-DD` y los meses como `YYYY-MM`.
- Formato de moneda europeo (`1.234,56 €`).
- Los balances de cartera se van guardando **por mes**; si falta un mes, el gráfico arrastra el último balance conocido.
- Los iconos de las pestañas usan la fuente de iconos incluida en Expo Go, así que no hace falta compilar nada nativo.
