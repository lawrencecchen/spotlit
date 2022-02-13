import {
  onCleanup,
  onMount,
  mergeProps,
  createSignal,
  createMemo,
  createResource,
  Show,
  Suspense,
} from "solid-js";
import { parse } from "@babel/parser";
import { transform } from "@babel/standalone";
import { createEffect } from "solid-js";
import { render } from "solid-js/web";

// @ts-ignore
// import babelPresetSolid from "babel-preset-solid";

const SOLID_VERSION = "1.3.6";

let cachedPreset;

async function loadBabel(solidVersion = SOLID_VERSION) {
  let solid;

  try {
    // const preset =
    //   solidVersion === SOLID_VERSION
    //     ? await Promise.resolve({ default: babelPresetSolid })
    //     : await import(
    //         /* @vite-ignore */ `https://esm.sh/babel-preset-solid@${solidVersion}`
    //       );
    const preset =
      cachedPreset ||
      (await import(
        /* @vite-ignore */ `https://esm.sh/babel-preset-solid@${solidVersion}`
      ));
    // const preset = await Promise.resolve({ default: babelPresetSolid });

    if (!cachedPreset) {
      cachedPreset = preset;
    }

    solid = preset.default;
  } catch {
    // solid = babelPresetSolid;
  }

  const babel = (code, opts = { babel: {}, solid: {} }) =>
    transform(code, {
      presets: [
        [solid, { ...opts.solid }],
        ["typescript", { onlyRemoveTypeImports: true }],
      ],
      ...opts.babel,
    });

  return babel;
}

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
    document.addEventListener("mousemove", mousemove);
  }

  function mouseup() {
    document.removeEventListener("mousemove", mousemove);
  }

  onMount(() => {
    el.addEventListener("mousedown", mousedown);
    document.addEventListener("mouseup", mouseup);
  });

  onCleanup(() => {
    el.removeEventListener("mousedown", mousedown);
    document.removeEventListener("mouseup", mouseup);
  });
}

function InputSlider(props) {
  let merged = mergeProps({ min: -1000, max: 1000 }, props);
  let inputRef;
  const [value, setValue] = createSignal(merged.value);

  function bound(value, min, max) {
    if (value > max) {
      return max;
    } else if (value < min) {
      return min;
    }
    return value;
  }

  function submit() {
    merged.onInput(bound(value(), merged.min, merged.max));
  }

  function keydown(e) {
    if (e.key === "Enter") {
      submit();
    }
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
      <input
        class="pr-3 tabular-nums py-1.5 outline-none cursor-default w-auto"
        type="text"
        onClick={() => inputRef.select()}
        onInput={(e) => setValue(+e.currentTarget.value)}
        onBlur={submit}
        ref={inputRef}
        value={merged.value}
        onKeyDown={keydown}
      />
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

function Editor(props) {
  const [fontSize, setFontSize] = createSignal(10);
  const code = createMemo(
    () =>
      `import { render } from 'solid-js/web'; function MyComponent() { return <div style="font-size: ${fontSize()}">Hello World</div> } export default function Preview() { return <MyComponent /> } render(<Preview />, document.getElementById('preview-area')); console.log(document.getElementById('preview-area'));`
  );
  const ast = createMemo(() =>
    parse(code(), { plugins: ["jsx"], sourceType: "module" })
  );
  const compiled = createMemo(() => {
    const result = props.babel(code(), {
      solid: {},
      babel: { filename: "test.tsx" },
    });
    return result.code;
  });

  createEffect(() => {
    // render(, previewRef)
  });

  let previewRef;

  return (
    <div class="flex h-full max-w-screen overflow-hidden">
      <div class="p-4 grow overflow-hidden min-w-0">
        <div class="border p-3" ref={previewRef} id="preview-area">
          {/* {createRoot(() =>)} */}
        </div>
        <script innerHTML={compiled()}></script>
        <script>console.log('heyo')</script>
        {/* <div class="border p-3" innerHTML={code()}></div> */}

        <div className="text-xs mt-4 space-y-3">
          <p>input</p>
          <pre class="mt-2 p-3 border overflow-scroll">{code()}</pre>
          <p>output</p>
          <pre class="mt-2 p-3 border overflow-scroll">{compiled()}</pre>
        </div>
      </div>

      <div class="h-full border-l max-w-[240px] w-full">
        <div class="p-4">
          <div className="flex">
            <NumberInputSlider
              label="Font"
              value={fontSize()}
              onInput={(v) => setFontSize(v)}
            />
            {/* <NumberInputSlider
              label="W"
              value={fontSize()}
              onInput={(v) => setFontSize(v)}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [babel] = createResource(() => loadBabel());

  return (
    <Show when={babel()} fallback="loading...">
      <Editor babel={babel()} />
    </Show>
  );
}

export default App;
