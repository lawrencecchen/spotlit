import { onCleanup, onMount, mergeProps, createSignal } from 'solid-js';
import babelParser from '@babel/parser';

console.log(babelParser);

function createDragOffset(el, accessor) {
  function mousemove(e) {
    const { movementX, movementY } = e;
    const offsetCoords = {
      movementX,
      movementY,
    };

    accessor()?.(offsetCoords);
  }

  function mousedown(e) {
    document.addEventListener('mousemove', mousemove);
  }

  function mouseup() {
    document.removeEventListener('mousemove', mousemove);
  }

  onMount(() => {
    el.addEventListener('mousedown', mousedown);
    document.addEventListener('mouseup', mouseup);
  });

  onCleanup(() => {
    el.removeEventListener('mousedown', mousedown);
    document.removeEventListener('mouseup', mouseup);
  });
}

function InputSlider(props) {
  let merged = mergeProps({ min: -1000, max: 1000 }, props);
  let inputRef;
  const [value, setValue] = createSignal(merged.value);

  function bound(value, min, max) {
    if (value > max) {
      console.log('max');
      return max;
    } else if (value < min) {
      console.log('min');
      return min;
    }
    return value;
  }

  function submit(e) {
    e.preventDefault();
    merged.onInput(bound(value(), merged.min, merged.max));
  }

  return (
    <div class="rounded-sm border border-transparent hover:border-gray-300 inline-flex items-baseline text-xs text-gray-900 cursor-default select-none focus-within:ring-1 focus-within:ring-blue-500/90 focus-within:border-blue-500/90">
      <div
        use:createDragOffset={({ movementX }) =>
          merged.onInput(
            bound(merged.value + movementX, merged.min, merged.max)
          )
        }
        class="text-gray-500 font-light px-3 py-1.5 cursor-ew-resize"
      >
        {merged.label}
      </div>
      <form onSubmit={submit} class="m-0">
        <input
          class="pr-3 tabular-nums py-1.5 outline-none cursor-default"
          type="text"
          onClick={() => inputRef.select()}
          onInput={(e) => setValue(+e.target.value)}
          ref={inputRef}
          value={merged.value}
        />
      </form>
    </div>
  );
}

function NumberInputSlider(props) {
  return (
    <InputSlider
      label={props.label}
      onInput={props.onInput}
      value={props.value}
    />
  );
}

function App() {
  const [fontSize, setFontSize] = createSignal(10);
  const [code, setCode] = createSignal('<div>hi</div>');

  return (
    <div class="flex h-full">
      <div class="p-4 flex-1">
        <div class="border p-3" innerHTML={code()}></div>
        <pre class="text-xs mt-2">{code()}</pre>
      </div>
      
      <div class="h-full border-l">
        <div class="p-4">
          <NumberInputSlider
            label="H"
            value={fontSize()}
            onInput={(v) => setFontSize(v)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
