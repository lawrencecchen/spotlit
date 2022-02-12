import { createSignal } from "solid-js";

function NumberInput(props) {
  return (
    <div class="rounded-sm border px-2 py-1 border-gray-200 inline-block text-gray-800 text-sm cursor-default">
      <div>{props.value}</div>

      <input
        type="number"
        hidden
        value={props.value}
        onInput={(e) => props.onInput(e.target.value)}
      />
    </div>
  );
}

function App() {
  const [fontSize, setFontSize] = createSignal(10);

  return (
    <div class="p-5">
      <NumberInput value={fontSize()} onInput={(v) => setFontSize(v)} />

    </div>
  );
}

export default App;
