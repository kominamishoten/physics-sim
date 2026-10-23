const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const g = 9.8;                     // 重力加速度 [m/s²]
const scale = 8;                   // 1 m を 8 px で描く
const ground = canvas.height - 10; // 地面の y 座標 [px]

const v0Input = document.getElementById("v0");
const angleInput = document.getElementById("angle");
const info = document.getElementById("info");

// スライダーを動かしたら数値を表示
for (const input of [v0Input, angleInput]) {
  input.addEventListener("input", () => {
    document.getElementById(input.id + "Val").textContent = input.value;
  });
}

let v0, theta, startTime, path, animId;

// 物理座標 [m] → 画面座標 [px]
function toCanvas(x, y) {
  return [10 + x * scale, ground - y * scale];
}

function frame(now) {
  if (startTime === null) startTime = now;
  let t = (now - startTime) / 1000; // 経過時間 [s]

  // 着地時刻 t = 2 v₀ sinθ / g を過ぎたら止める
  const tEnd = 2 * v0 * Math.sin(theta) / g;
  const landed = t >= tEnd;
  if (landed) t = tEnd;

  // 等加速度運動の式
  const x = v0 * Math.cos(theta) * t;
  const y = v0 * Math.sin(theta) * t - 0.5 * g * t * t;
  path.push(toCanvas(x, y));

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 地面
  ctx.strokeStyle = "#888";
  ctx.beginPath();
  ctx.moveTo(0, ground);
  ctx.lineTo(canvas.width, ground);
  ctx.stroke();

  // 軌跡
  ctx.strokeStyle = "#4a90e2";
  ctx.beginPath();
  path.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();

  // ボール
  const [bx, by] = path[path.length - 1];
  ctx.fillStyle = "#e24a4a";
  ctx.beginPath();
  ctx.arc(bx, by, 6, 0, Math.PI * 2);
  ctx.fill();

  info.textContent = `t = ${t.toFixed(2)} s　x = ${x.toFixed(1)} m　y = ${Math.max(y, 0).toFixed(1)} m`;

  if (!landed) animId = requestAnimationFrame(frame);
}

document.getElementById("start").addEventListener("click", () => {
  cancelAnimationFrame(animId);
  v0 = Number(v0Input.value);
  theta = Number(angleInput.value) * Math.PI / 180;
  startTime = null;
  path = [];
  animId = requestAnimationFrame(frame);
});
