import {
  Archive,
  BookOpen,
  ChevronRight,
  CloudUpload,
  FileDown,
  Grid2X2,
  Package,
  PieChart,
  Plus,
  RotateCw,
  Save,
  Search,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

const STORAGE_KEY = "sen-mobile-v1";

const SUPPLIERS = ["岡山FS", "ヴォングスト", "業務スーパー", "アルプラザ", "その他"];

const BLANK_RECIPE_DRAFT = { kind: "product", name: "" };

const DEFAULT_DATA = {
  ingredients: [
    { id: "ING_001", name: "茶美豚肩ロース 正肉", supplier: "岡山FS", purchaseAmount: 1000, purchaseUnit: "g", price: 1980, yieldRate: 0.95, memo: "2層焼きつくね用" },
    { id: "ING_002", name: "国産冷凍豚アミ脂小分け", supplier: "ヴォングスト", purchaseAmount: 500, purchaseUnit: "g", price: 680, yieldRate: 1, memo: "" },
    { id: "ING_003", name: "鶏ももミンチ", supplier: "業務スーパー", purchaseAmount: 1000, purchaseUnit: "g", price: 780, yieldRate: 0.98, memo: "" },
    { id: "ING_004", name: "濃口醤油", supplier: "アルプラザ", purchaseAmount: 1000, purchaseUnit: "ml", price: 398, yieldRate: 1, memo: "" },
    { id: "ING_005", name: "本みりん", supplier: "アルプラザ", purchaseAmount: 1000, purchaseUnit: "ml", price: 598, yieldRate: 1, memo: "" },
    { id: "ING_006", name: "きび砂糖", supplier: "その他", purchaseAmount: 1000, purchaseUnit: "g", price: 420, yieldRate: 1, memo: "" },
    { id: "ING_007", name: "卵黄", supplier: "岡山FS", purchaseAmount: 10, purchaseUnit: "個", price: 280, yieldRate: 1, memo: "" },
    { id: "ING_008", name: "うにペースト", supplier: "ヴォングスト", purchaseAmount: 250, purchaseUnit: "g", price: 3200, yieldRate: 1, memo: "高原価チェック用" },
  ],
  parts: [
    { id: "PRT_001", name: "サルシッチャ", servings: 10, batchAmount: 1000, batchUnit: "g", memo: "つくね上層" },
    { id: "PRT_002", name: "パテ", servings: 10, batchAmount: 900, batchUnit: "g", memo: "つくね下層" },
    { id: "PRT_003", name: "つけタレ", servings: 20, batchAmount: 600, batchUnit: "ml", memo: "" },
  ],
  products: [
    { id: "RCP_001", name: "2層焼きつくね", salePrice: 980, servings: 4, memo: "看板候補" },
    { id: "RCP_002", name: "うにクリームパスタ", salePrice: 1380, servings: 1, memo: "要調整" },
    { id: "RCP_003", name: "本日の鮮魚カルパッチョ", salePrice: 1180, servings: 1, memo: "" },
  ],
  lines: [
    { id: "LIN_001", ownerType: "part", ownerId: "PRT_001", itemType: "ingredient", itemId: "ING_001", qty: 650, unit: "g", memo: "" },
    { id: "LIN_002", ownerType: "part", ownerId: "PRT_001", itemType: "ingredient", itemId: "ING_002", qty: 160, unit: "g", memo: "" },
    { id: "LIN_003", ownerType: "part", ownerId: "PRT_002", itemType: "ingredient", itemId: "ING_003", qty: 780, unit: "g", memo: "" },
    { id: "LIN_004", ownerType: "part", ownerId: "PRT_003", itemType: "ingredient", itemId: "ING_004", qty: 220, unit: "ml", memo: "" },
    { id: "LIN_005", ownerType: "part", ownerId: "PRT_003", itemType: "ingredient", itemId: "ING_005", qty: 180, unit: "ml", memo: "" },
    { id: "LIN_006", ownerType: "part", ownerId: "PRT_003", itemType: "ingredient", itemId: "ING_006", qty: 90, unit: "g", memo: "" },
    { id: "LIN_007", ownerType: "product", ownerId: "RCP_001", itemType: "part", itemId: "PRT_001", qty: 320, unit: "g", memo: "仕込み1" },
    { id: "LIN_008", ownerType: "product", ownerId: "RCP_001", itemType: "part", itemId: "PRT_002", qty: 280, unit: "g", memo: "仕込み2" },
    { id: "LIN_009", ownerType: "product", ownerId: "RCP_001", itemType: "part", itemId: "PRT_003", qty: 80, unit: "ml", memo: "仕込み3" },
    { id: "LIN_010", ownerType: "product", ownerId: "RCP_001", itemType: "ingredient", itemId: "ING_007", qty: 4, unit: "個", memo: "仕上げ" },
    { id: "LIN_011", ownerType: "product", ownerId: "RCP_002", itemType: "ingredient", itemId: "ING_004", qty: 40, unit: "ml", memo: "" },
    { id: "LIN_012", ownerType: "product", ownerId: "RCP_002", itemType: "ingredient", itemId: "ING_008", qty: 80, unit: "g", memo: "主原料" },
    { id: "LIN_013", ownerType: "product", ownerId: "RCP_003", itemType: "ingredient", itemId: "ING_001", qty: 180, unit: "g", memo: "仮食材" },
  ],
  meta: { lastBackup: "未作成", lastExport: "未出力", updatedAt: new Date().toISOString() },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : DEFAULT_DATA;
  } catch {
    return DEFAULT_DATA;
  }
}

function persist(nextData) {
  const stamped = {
    ...nextData,
    meta: { ...nextData.meta, updatedAt: new Date().toISOString() },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
  return stamped;
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nextId(prefix, items) {
  const max = items.reduce((current, item) => {
    const found = String(item.id || "").match(/(\d+)$/);
    return found ? Math.max(current, Number(found[1])) : current;
  }, 0);
  return `${prefix}_${String(max + 1).padStart(3, "0")}`;
}

function yen(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return `${Math.round(safe).toLocaleString("ja-JP")}円`;
}

function pct(value) {
  if (!Number.isFinite(value)) return "0.0%";
  return `${(value * 100).toFixed(1)}%`;
}

function dateTimeText(value) {
  if (!value || value === "未作成" || value === "未出力") return value || "未作成";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function unitPrice(ingredient) {
  const amount = numberValue(ingredient.purchaseAmount);
  return amount > 0 ? numberValue(ingredient.price) / amount : 0;
}

function effectiveUnitPrice(ingredient) {
  const yieldRate = numberValue(ingredient.yieldRate);
  return yieldRate > 0 ? unitPrice(ingredient) / yieldRate : 0;
}

function buildModel(data) {
  const ingredientMap = new Map(data.ingredients.map((item) => [item.id, item]));
  const partMap = new Map(data.parts.map((item) => [item.id, item]));

  const partTotal = (partId) =>
    data.lines
      .filter((line) => line.ownerType === "part" && line.ownerId === partId)
      .reduce((total, line) => {
        const ingredient = ingredientMap.get(line.itemId);
        return total + numberValue(line.qty) * effectiveUnitPrice(ingredient || {});
      }, 0);

  const partUnitCost = (partId) => {
    const part = partMap.get(partId);
    const amount = numberValue(part?.batchAmount);
    return amount > 0 ? partTotal(partId) / amount : 0;
  };

  const lineName = (line) => {
    if (line.itemType === "part") return partMap.get(line.itemId)?.name || "未登録レシピ";
    return ingredientMap.get(line.itemId)?.name || "未登録食材";
  };

  const lineCost = (line) => {
    if (line.itemType === "part") return numberValue(line.qty) * partUnitCost(line.itemId);
    return numberValue(line.qty) * effectiveUnitPrice(ingredientMap.get(line.itemId) || {});
  };

  const productRows = data.products.map((product) => {
    const productLines = data.lines.filter((line) => line.ownerType === "product" && line.ownerId === product.id);
    const totalCost = productLines.reduce((total, line) => total + lineCost(line), 0);
    const servings = Math.max(numberValue(product.servings), 1);
    const costPerServing = totalCost / servings;
    const salePrice = numberValue(product.salePrice);
    const costRate = salePrice > 0 ? costPerServing / salePrice : 0;
    const grossProfit = salePrice - costPerServing;
    const grossProfitRate = salePrice > 0 ? grossProfit / salePrice : 0;

    return {
      ...product,
      lines: productLines,
      totalCost,
      costPerServing,
      costRate,
      grossProfit,
      grossProfitRate,
    };
  });

  const partRows = data.parts.map((part) => ({
    ...part,
    totalCost: partTotal(part.id),
    unitCost: partUnitCost(part.id),
    lines: data.lines.filter((line) => line.ownerType === "part" && line.ownerId === part.id),
  }));

  const averageCostRate =
    productRows.length > 0
      ? productRows.reduce((sum, row) => sum + row.costRate, 0) / productRows.length
      : 0;

  const averageGrossProfitRate =
    productRows.length > 0
      ? productRows.reduce((sum, row) => sum + row.grossProfitRate, 0) / productRows.length
      : 0;

  return {
    ingredientMap,
    partMap,
    productRows,
    partRows,
    lineName,
    lineCost,
    partUnitCost,
    partTotal,
    averageCostRate,
    averageGrossProfitRate,
  };
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
}

function downloadText(filename, text, type = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function createCsvFiles(data, model) {
  const today = new Date().toLocaleDateString("ja-JP");
  const ingredients = [
    ["食材ID", "食材名", "仕入先", "購入量", "購入単位", "購入価格", "基準単位", "単価", "歩留まり率", "実質単価", "メモ", "更新日"],
    ...data.ingredients.map((item) => [
      item.id,
      item.name,
      item.supplier,
      item.purchaseAmount,
      item.purchaseUnit,
      Math.round(numberValue(item.price)),
      item.purchaseUnit,
      unitPrice(item).toFixed(4),
      item.yieldRate,
      effectiveUnitPrice(item).toFixed(4),
      item.memo,
      today,
    ]),
  ];

  const parts = [
    ["パーツID", "パーツ名", "何人前", "仕込み量", "仕込み単位", "合計原価", "1単位あたり原価", "メモ"],
    ...model.partRows.map((part) => [
      part.id,
      part.name,
      part.servings,
      part.batchAmount,
      part.batchUnit,
      model.partTotal(part.id).toFixed(2),
      model.partUnitCost(part.id).toFixed(4),
      part.memo,
    ]),
  ];

  const products = [
    ["レシピID", "商品名", "何人前", "売価", "合計原価", "1人前原価", "原価率", "粗利", "粗利率", "メモ"],
    ...model.productRows.map((product) => [
      product.id,
      product.name,
      product.servings,
      Math.round(numberValue(product.salePrice)),
      product.totalCost.toFixed(2),
      product.costPerServing.toFixed(2),
      product.costRate,
      product.grossProfit.toFixed(2),
      product.grossProfitRate,
      product.memo,
    ]),
  ];

  const recipeLines = [
    ["明細ID", "親種別", "親ID", "親名", "区分", "食材ID", "食材名", "パーツID", "パーツ名", "使用量", "使用単位", "実質単価", "原価", "メモ"],
    ...data.lines.map((line) => {
      const parent =
        line.ownerType === "part"
          ? data.parts.find((part) => part.id === line.ownerId)
          : data.products.find((product) => product.id === line.ownerId);
      const ingredient = line.itemType === "ingredient" ? data.ingredients.find((item) => item.id === line.itemId) : null;
      const part = line.itemType === "part" ? data.parts.find((item) => item.id === line.itemId) : null;
      const effective = ingredient ? effectiveUnitPrice(ingredient) : model.partUnitCost(part?.id);
      return [
        line.id,
        line.ownerType === "part" ? "パーツ" : "商品",
        line.ownerId,
        parent?.name || "",
        line.itemType === "part" ? "パーツ" : "食材",
        ingredient?.id || "",
        ingredient?.name || "",
        part?.id || "",
        part?.name || "",
        line.qty,
        line.unit,
        effective.toFixed(4),
        model.lineCost(line).toFixed(2),
        line.memo,
      ];
    }),
  ];

  return {
    "ingredients.csv": toCsv(ingredients),
    "parts.csv": toCsv(parts),
    "products.csv": toCsv(products),
    "recipe_lines.csv": toCsv(recipeLines),
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(current);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function csvRowsToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const result = {};
    headers.forEach((header, index) => {
      result[header] = row[index] ?? "";
    });
    return result;
  });
}

function valueFrom(row, names, fallback = "") {
  for (const name of names) {
    if (row[name] !== undefined && String(row[name]).trim() !== "") return row[name];
  }
  return fallback;
}

function numberFrom(row, names, fallback = 0) {
  const value = String(valueFrom(row, names, fallback)).replace(/,/g, "");
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function readCsvImportFiles(fileList) {
  const files = [...fileList];
  const byName = new Map(files.map((file) => [file.name.toLowerCase(), file]));
  const required = ["ingredients.csv", "parts.csv", "products.csv", "recipe_lines.csv"];
  const missing = required.filter((name) => !byName.has(name));
  if (missing.length > 0) {
    throw new Error(`不足CSV: ${missing.join(", ")}`);
  }

  const read = async (name) => csvRowsToObjects(parseCsv(await byName.get(name).text()));
  return {
    ingredients: await read("ingredients.csv"),
    parts: await read("parts.csv"),
    products: await read("products.csv"),
    lines: await read("recipe_lines.csv"),
  };
}

function dataFromCsvObjects(csv) {
  const ingredients = csv.ingredients
    .map((row, index) => ({
      id: String(valueFrom(row, ["食材ID"], `ING_${String(index + 1).padStart(3, "0")}`)).trim(),
      name: String(valueFrom(row, ["食材名"], "")).trim(),
      supplier: String(valueFrom(row, ["仕入先"], "その他")).trim() || "その他",
      purchaseAmount: numberFrom(row, ["購入量"], 0),
      purchaseUnit: String(valueFrom(row, ["購入単位", "基準単位"], "g")).trim() || "g",
      price: numberFrom(row, ["購入価格"], 0),
      yieldRate: numberFrom(row, ["歩留まり率"], 1) || 1,
      memo: String(valueFrom(row, ["メモ"], "")),
    }))
    .filter((item) => item.name);

  const ingredientById = new Map(ingredients.map((item) => [item.id, item]));
  const ingredientByName = new Map(ingredients.map((item) => [item.name, item]));

  const parts = csv.parts
    .map((row, index) => ({
      id: String(valueFrom(row, ["パーツID"], `PRT_${String(index + 1).padStart(3, "0")}`)).trim(),
      name: String(valueFrom(row, ["パーツ名"], "")).trim(),
      servings: numberFrom(row, ["何人前", "何人前分量"], 1) || 1,
      batchAmount: numberFrom(row, ["仕込み量", "BatchQty"], numberFrom(row, ["何人前", "何人前分量"], 1)) || 1,
      batchUnit: String(valueFrom(row, ["仕込み単位", "BatchUnit"], "人前")).trim() || "人前",
      memo: String(valueFrom(row, ["メモ"], "")),
    }))
    .filter((item) => item.name);

  const partById = new Map(parts.map((item) => [item.id, item]));
  const partByName = new Map(parts.map((item) => [item.name, item]));

  const products = csv.products
    .map((row, index) => ({
      id: String(valueFrom(row, ["レシピID"], `RCP_${String(index + 1).padStart(3, "0")}`)).trim(),
      name: String(valueFrom(row, ["商品名", "レシピ名"], "")).trim(),
      salePrice: numberFrom(row, ["売価"], 0),
      servings: numberFrom(row, ["何人前", "何人前分量"], 1) || 1,
      memo: String(valueFrom(row, ["メモ"], "")),
    }))
    .filter((item) => item.name);

  const productById = new Map(products.map((item) => [item.id, item]));
  const productByName = new Map(products.map((item) => [item.name, item]));

  const lines = csv.lines
    .map((row, index) => {
      const ownerLabel = String(valueFrom(row, ["親種別", "OwnerType"], ""));
      const ownerName = String(valueFrom(row, ["親名", "OwnerName"], "")).trim();
      const itemKind = String(valueFrom(row, ["区分", "ItemType"], ""));
      const foodName = String(valueFrom(row, ["食材名"], "")).trim();
      const partName = String(valueFrom(row, ["パーツ名"], "")).trim();
      const ownerType = ownerLabel.includes("パーツ") || ownerLabel.toLowerCase() === "part" ? "part" : "product";
      const ownerId =
        String(valueFrom(row, ["親ID", "OwnerID"], "")).trim() ||
        (ownerType === "part" ? partByName.get(ownerName)?.id : productByName.get(ownerName)?.id) ||
        "";
      const isPartItem = itemKind.includes("パーツ") || Boolean(partName);
      const itemType = isPartItem ? "part" : "ingredient";
      const itemId =
        String(valueFrom(row, [isPartItem ? "パーツID" : "食材ID"], "")).trim() ||
        (isPartItem ? partByName.get(partName)?.id : ingredientByName.get(foodName)?.id) ||
        "";
      const fallbackUnit = itemType === "part" ? partById.get(itemId)?.batchUnit || "人前" : ingredientById.get(itemId)?.purchaseUnit || "g";

      return {
        id: String(valueFrom(row, ["明細ID", "LineID"], `LIN_${String(index + 1).padStart(3, "0")}`)).trim(),
        ownerType,
        ownerId,
        itemType,
        itemId,
        qty: numberFrom(row, ["使用量", "UsageQty"], 0),
        unit: String(valueFrom(row, ["使用単位", "UsageUnit"], fallbackUnit)).trim() || fallbackUnit,
        memo: String(valueFrom(row, ["メモ"], "")),
      };
    })
    .filter((line) => line.ownerId && line.itemId);

  return {
    ingredients,
    parts,
    products,
    lines,
    meta: { lastBackup: "未作成", lastExport: "未出力", updatedAt: new Date().toISOString() },
  };
}

function KpiRow({ icon: Icon, label, value, detail, tone = "green" }) {
  return (
    <button className="kpi-row" type="button">
      <span className={`kpi-icon ${tone}`}>
        <Icon size={25} strokeWidth={2.4} />
      </span>
      <span className="kpi-label">{label}</span>
      <span className={`kpi-value ${tone}`}>{value}</span>
      <span className="kpi-detail">{detail}</span>
      <ChevronRight className="kpi-chevron" size={22} />
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action}
    </div>
  );
}

export function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchText, setSearchText] = useState("");
  const [lineTarget, setLineTarget] = useState({ ownerType: "product", ownerId: "RCP_001", itemType: "part", itemId: "PRT_001", supplier: "岡山FS", qty: 100, unit: "g" });
  const [ingredientDraft, setIngredientDraft] = useState({ name: "", supplier: "岡山FS", purchaseAmount: 1000, purchaseUnit: "g", price: 0, yieldRate: 1, memo: "" });
  const [productDraft, setProductDraft] = useState(BLANK_RECIPE_DRAFT);
  const importRef = useRef(null);
  const csvImportRef = useRef(null);

  const model = useMemo(() => buildModel(data), [data]);

  const save = (producer) => {
    setData((current) => persist(typeof producer === "function" ? producer(current) : producer));
  };

  const updateIngredient = (id, field, value) => {
    const numeric = ["purchaseAmount", "price", "yieldRate"].includes(field);
    save((current) => ({
      ...current,
      ingredients: current.ingredients.map((item) => (item.id === id ? { ...item, [field]: numeric ? numberValue(value) : value } : item)),
    }));
  };

  const updateProduct = (id, field, value) => {
    const numeric = ["salePrice", "servings"].includes(field);
    save((current) => ({
      ...current,
      products: current.products.map((item) => (item.id === id ? { ...item, [field]: numeric ? numberValue(value) : value } : item)),
    }));
  };

  const updatePart = (id, field, value) => {
    const numeric = ["servings", "batchAmount"].includes(field);
    save((current) => ({
      ...current,
      parts: current.parts.map((item) => (item.id === id ? { ...item, [field]: numeric ? numberValue(value) : value } : item)),
    }));
  };

  const addIngredient = () => {
    if (!ingredientDraft.name.trim()) return;
    save((current) => ({
      ...current,
      ingredients: [
        ...current.ingredients,
        { ...ingredientDraft, id: nextId("ING", current.ingredients), name: ingredientDraft.name.trim() },
      ],
    }));
    setIngredientDraft({ name: "", supplier: "岡山FS", purchaseAmount: 1000, purchaseUnit: "g", price: 0, yieldRate: 1, memo: "" });
  };

  const addProductOrPart = () => {
    if (!productDraft.name.trim()) return;
    if (productDraft.kind === "part") {
      save((current) => ({
        ...current,
        parts: [
          ...current.parts,
          {
            id: nextId("PRT", current.parts),
            name: productDraft.name.trim(),
            servings: 1,
            batchAmount: 1,
            batchUnit: "人前",
            memo: "",
          },
        ],
      }));
    } else {
      save((current) => ({
        ...current,
        products: [
          ...current.products,
          {
            id: nextId("RCP", current.products),
            name: productDraft.name.trim(),
            salePrice: 0,
            servings: 1,
            memo: "",
          },
        ],
      }));
    }
    setProductDraft(BLANK_RECIPE_DRAFT);
  };

  const addLine = () => {
    const ownerType = lineTarget.ownerType;
    const ownerId = lineTarget.ownerId;
    const itemType = ownerType === "part" ? "ingredient" : lineTarget.itemType;
    const itemId = lineTarget.itemId;
    if (!ownerId || !itemId) return;
    save((current) => ({
      ...current,
      lines: [
        ...current.lines,
        {
          id: nextId("LIN", current.lines),
          ownerType,
          ownerId,
          itemType,
          itemId,
          qty: numberValue(lineTarget.qty),
          unit: lineTarget.unit || "g",
          memo: "",
        },
      ],
    }));
  };

  const removeLine = (id) => {
    save((current) => ({
      ...current,
      lines: current.lines.filter((line) => line.id !== id),
    }));
  };

  const updateLineQty = (id, value) => {
    save((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, qty: numberValue(value) } : line)),
    }));
  };

  const exportCsv = () => {
    const files = createCsvFiles(data, model);
    Object.entries(files).forEach(([filename, text]) => {
      downloadText(filename, `\uFEFF${text}`);
    });
    save((current) => ({ ...current, meta: { ...current.meta, lastExport: new Date().toISOString() } }));
  };

  const backupJson = () => {
    const stamped = persist({ ...data, meta: { ...data.meta, lastBackup: new Date().toISOString() } });
    setData(stamped);
    downloadText(`sen-mobile-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(stamped, null, 2), "application/json;charset=utf-8");
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      const next = persist({ ...DEFAULT_DATA, ...parsed, meta: { ...parsed.meta, updatedAt: new Date().toISOString() } });
      setData(next);
    } catch {
      alert("バックアップJSONを読み込めませんでした。");
    } finally {
      event.target.value = "";
    }
  };

  const importCsv = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    try {
      const csv = await readCsvImportFiles(files);
      const next = persist(dataFromCsvObjects(csv));
      setData(next);
      setActiveTab("dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "CSVを読み込めませんでした。");
    } finally {
      event.target.value = "";
    }
  };

  const resetDemo = () => {
    const next = persist(DEFAULT_DATA);
    setData(next);
  };

  const filteredProducts = model.productRows
    .filter((row) => row.name.includes(searchText))
    .sort((a, b) => b.costRate - a.costRate);

  const filteredParts = model.partRows
    .filter((row) => row.name.includes(searchText))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  const productInfoRows = [...model.productRows].sort((a, b) => b.costRate - a.costRate);

  const activeOwnerOptions = lineTarget.ownerType === "product" ? data.products : data.parts;
  const resolvedItemType = lineTarget.ownerType === "part" ? "ingredient" : lineTarget.itemType;
  const supplierIngredients = data.ingredients.filter((item) => item.supplier === lineTarget.supplier);
  const activeItemOptions = resolvedItemType === "part" ? data.parts : supplierIngredients;

  const firstIngredientForSupplier = (supplier) =>
    data.ingredients.find((item) => item.supplier === supplier)?.id || data.ingredients[0]?.id || "";

  const defaultUnitForItem = (itemType, itemId) => {
    if (itemType === "part") return data.parts.find((item) => item.id === itemId)?.batchUnit || "人前";
    return data.ingredients.find((item) => item.id === itemId)?.purchaseUnit || "g";
  };

  const updateLineItemType = (itemType) => {
    const itemId = itemType === "part" ? data.parts[0]?.id || "" : firstIngredientForSupplier(lineTarget.supplier);
    setLineTarget({
      ...lineTarget,
      itemType,
      itemId,
      unit: defaultUnitForItem(itemType, itemId),
    });
  };

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <header className="top-bar">
          <div>
            <h1>SEN Mobile</h1>
            <p>最終バックアップ: {dateTimeText(data.meta.lastBackup)}</p>
            <p>出力ステータス: {data.meta.lastExport === "未出力" ? "未出力" : "最新（CSV出力済み）"}</p>
          </div>
          <div className="top-actions">
            <button className="sync-button" type="button" onClick={exportCsv}>
              <CloudUpload size={20} />
              <span>同期・出力</span>
            </button>
            <p>最終同期: {data.meta.lastExport === "未出力" ? "未実行" : dateTimeText(data.meta.lastExport)}</p>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <section className="screen dashboard-screen">
            <KpiRow icon={TrendingUp} label="平均原価率" value={pct(model.averageCostRate)} detail="商品平均" />
            <KpiRow icon={PieChart} label="平均粗利率" value={pct(model.averageGrossProfitRate)} detail="売価基準" />
            <KpiRow icon={Package} label="登録レシピ" value={(data.products.length + data.parts.length).toLocaleString("ja-JP")} detail={`販売 ${data.products.length} / 仕込み ${data.parts.length}`} />
            <section className="panel">
              <SectionTitle
                action={
                  <button className="text-button" type="button" onClick={() => setActiveTab("recipes")}>
                    編集する <ChevronRight size={18} />
                  </button>
                }
              >
                販売レシピ情報
              </SectionTitle>
              <div className="product-info-list">
                {productInfoRows.map((row) => (
                  <button className="product-info-row" type="button" key={row.id} onClick={() => setActiveTab("recipes")}>
                    <div className="product-info-main">
                      <strong>{row.name}</strong>
                      <span>{row.id} / {row.servings}人前 / 売価 {yen(row.salePrice)}</span>
                    </div>
                    <div className="product-info-metrics">
                      <span>
                        <small>1人前原価</small>
                        <b>{yen(row.costPerServing)}</b>
                      </span>
                      <span>
                        <small>原価率</small>
                        <b className={row.costRate >= 0.35 ? "danger-text" : "green-text"}>{pct(row.costRate)}</b>
                      </span>
                      <span>
                        <small>粗利</small>
                        <b>{yen(row.grossProfit)}</b>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="table-note">原価率の高い順に販売レシピを表示しています</p>
            </section>
          </section>
        )}

        {activeTab === "recipes" && (
          <section className="screen">
            <div className="search-box">
              <Search size={18} />
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="レシピ名で検索" />
            </div>

            <section className="panel">
              <SectionTitle>レシピ追加</SectionTitle>
              <div className="form-grid">
                <Field label="種類">
                  <select value={productDraft.kind} onChange={(event) => setProductDraft({ ...productDraft, kind: event.target.value })}>
                    <option value="product">販売レシピ</option>
                    <option value="part">仕込みレシピ</option>
                  </select>
                </Field>
                <Field label="レシピ名">
                  <input value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} placeholder="例: 2層焼きつくね" />
                </Field>
              </div>
              <button className="primary-button" type="button" onClick={addProductOrPart}>
                <Plus size={18} />
                レシピを追加
              </button>
            </section>

            <section className="panel">
              <SectionTitle>明細追加</SectionTitle>
              <div className="form-grid">
                <Field label="追加先の種類">
                  <select
                    value={lineTarget.ownerType}
                    onChange={(event) => {
                      const ownerType = event.target.value;
                      const nextItemType = ownerType === "part" ? "ingredient" : lineTarget.itemType;
                      const itemId = nextItemType === "part" ? data.parts[0]?.id || "" : firstIngredientForSupplier(lineTarget.supplier);
                      setLineTarget({
                        ...lineTarget,
                        ownerType,
                        ownerId: ownerType === "product" ? data.products[0]?.id : data.parts[0]?.id,
                        itemType: nextItemType,
                        itemId,
                        unit: defaultUnitForItem(nextItemType, itemId),
                      });
                    }}
                  >
                    <option value="product">販売レシピ</option>
                    <option value="part">仕込みレシピ</option>
                  </select>
                </Field>
                <Field label="追加先レシピ">
                  <select value={lineTarget.ownerId} onChange={(event) => setLineTarget({ ...lineTarget, ownerId: event.target.value })}>
                    {activeOwnerOptions.map((item) => (
                      <option value={item.id} key={item.id}>{item.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="追加するもの">
                  <select value={resolvedItemType} onChange={(event) => updateLineItemType(event.target.value)} disabled={lineTarget.ownerType === "part"}>
                    {lineTarget.ownerType === "product" && <option value="part">仕込みレシピ</option>}
                    <option value="ingredient">食材</option>
                  </select>
                </Field>
                {resolvedItemType === "ingredient" && (
                  <Field label="仕入先">
                    <select
                      value={lineTarget.supplier}
                      onChange={(event) => {
                        const supplier = event.target.value;
                        const itemId = firstIngredientForSupplier(supplier);
                        setLineTarget({
                          ...lineTarget,
                          supplier,
                          itemId,
                          unit: defaultUnitForItem("ingredient", itemId),
                        });
                      }}
                    >
                      {SUPPLIERS.map((supplier) => (
                        <option value={supplier} key={supplier}>{supplier}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label={resolvedItemType === "part" ? "レシピ名" : "食材名"}>
                  <select
                    value={activeItemOptions.some((item) => item.id === lineTarget.itemId) ? lineTarget.itemId : activeItemOptions[0]?.id || ""}
                    onChange={(event) => {
                      const itemId = event.target.value;
                      setLineTarget({
                        ...lineTarget,
                        itemId,
                        unit: defaultUnitForItem(resolvedItemType, itemId),
                      });
                    }}
                  >
                    {activeItemOptions.map((item) => (
                      <option value={item.id} key={item.id}>{item.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="使用量">
                  <input type="number" min="0" value={lineTarget.qty} onChange={(event) => setLineTarget({ ...lineTarget, qty: event.target.value })} />
                </Field>
                <Field label="単位">
                  <input value={lineTarget.unit} onChange={(event) => setLineTarget({ ...lineTarget, unit: event.target.value })} />
                </Field>
              </div>
              <button className="primary-button" type="button" onClick={addLine}>
                <Plus size={18} />
                明細を追加
              </button>
            </section>

            <section className="recipe-list">
              <SectionTitle>販売レシピ</SectionTitle>
              {filteredProducts.map((row) => (
                <article className="recipe-card" key={row.id}>
                  <div className="recipe-card-head">
                    <div>
                      <h3>{row.name}</h3>
                      <p>{row.id} / {row.servings}人前</p>
                    </div>
                  </div>
                  <div className="metric-strip">
                    <span><small>1人前原価</small>{yen(row.costPerServing)}</span>
                    <span><small>原価率</small>{pct(row.costRate)}</span>
                    <span><small>粗利</small>{yen(row.grossProfit)}</span>
                  </div>
                  <div className="inline-edit">
                    <Field label="売価">
                      <input type="number" min="0" value={row.salePrice} onChange={(event) => updateProduct(row.id, "salePrice", event.target.value)} />
                    </Field>
                    <Field label="何人前">
                      <input type="number" min="1" value={row.servings} onChange={(event) => updateProduct(row.id, "servings", event.target.value)} />
                    </Field>
                  </div>
                  <div className="line-list">
                    {row.lines.map((line) => (
                      <div className="line-row" key={line.id}>
                        <span>{model.lineName(line)}</span>
                        <input type="number" min="0" value={line.qty} onChange={(event) => updateLineQty(line.id, event.target.value)} />
                        <small>{line.unit}</small>
                        <b>{yen(model.lineCost(line))}</b>
                        <button type="button" onClick={() => removeLine(line.id)}>削除</button>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <section className="part-list">
              <SectionTitle>仕込みレシピ</SectionTitle>
              {filteredParts.map((part) => (
                <article className="part-card" key={part.id}>
                  <div>
                    <strong>{part.name}</strong>
                    <span>{part.id} / {part.servings}人前</span>
                  </div>
                  <Field label="仕込み量">
                    <input type="number" min="0" value={part.batchAmount} onChange={(event) => updatePart(part.id, "batchAmount", event.target.value)} />
                  </Field>
                  <Field label="単位">
                    <input value={part.batchUnit} onChange={(event) => updatePart(part.id, "batchUnit", event.target.value)} />
                  </Field>
                  <Field label="何人前">
                    <input type="number" min="0" value={part.servings} onChange={(event) => updatePart(part.id, "servings", event.target.value)} />
                  </Field>
                  <b>{yen(part.unitCost)} / {part.batchUnit}</b>
                </article>
              ))}
            </section>
          </section>
        )}

        {activeTab === "ingredients" && (
          <section className="screen">
            <section className="panel">
              <SectionTitle>食材追加</SectionTitle>
              <div className="form-grid">
                <Field label="食材名">
                  <input value={ingredientDraft.name} onChange={(event) => setIngredientDraft({ ...ingredientDraft, name: event.target.value })} placeholder="例: 茶美豚肩ロース" />
                </Field>
                <Field label="仕入先">
                  <select value={ingredientDraft.supplier} onChange={(event) => setIngredientDraft({ ...ingredientDraft, supplier: event.target.value })}>
                    {SUPPLIERS.map((supplier) => (
                      <option value={supplier} key={supplier}>{supplier}</option>
                    ))}
                  </select>
                </Field>
                <Field label="購入量">
                  <input type="number" min="0" value={ingredientDraft.purchaseAmount} onChange={(event) => setIngredientDraft({ ...ingredientDraft, purchaseAmount: event.target.value })} />
                </Field>
                <Field label="単位">
                  <input value={ingredientDraft.purchaseUnit} onChange={(event) => setIngredientDraft({ ...ingredientDraft, purchaseUnit: event.target.value })} />
                </Field>
                <Field label="購入価格">
                  <input type="number" min="0" value={ingredientDraft.price} onChange={(event) => setIngredientDraft({ ...ingredientDraft, price: event.target.value })} />
                </Field>
                <Field label="歩留まり">
                  <input type="number" min="0" step="0.01" value={ingredientDraft.yieldRate} onChange={(event) => setIngredientDraft({ ...ingredientDraft, yieldRate: event.target.value })} />
                </Field>
              </div>
              <button className="primary-button" type="button" onClick={addIngredient}>
                <Plus size={18} />
                食材を追加
              </button>
            </section>

            {SUPPLIERS.map((supplier) => {
              const items = data.ingredients.filter((item) => item.supplier === supplier);
              if (items.length === 0) return null;
              return (
                <section className="supplier-section" key={supplier}>
                  <h2>{supplier}</h2>
                  {items.map((item) => (
                    <article className="ingredient-row" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.purchaseAmount}{item.purchaseUnit} / {yen(item.price)}</span>
                      </div>
                      <div className="ingredient-edit">
                        <input type="number" min="0" value={item.price} onChange={(event) => updateIngredient(item.id, "price", event.target.value)} />
                        <input type="number" min="0" step="0.01" value={item.yieldRate} onChange={(event) => updateIngredient(item.id, "yieldRate", event.target.value)} />
                      </div>
                      <b>{yen(effectiveUnitPrice(item))}/{item.purchaseUnit}</b>
                    </article>
                  ))}
                </section>
              );
            })}
          </section>
        )}

        {activeTab === "export" && (
          <section className="screen">
            <section className="panel export-panel">
              <Archive size={35} />
              <h2>Excel v6へ戻す</h2>
              <p>4つのCSVを出力します。Excel側では次の取り込みVBAで、食材・販売レシピ・仕込みレシピ・明細に戻せる設計です。</p>
              <div className="export-list">
                <span>ingredients.csv（食材）</span>
                <span>products.csv（販売レシピ）</span>
                <span>parts.csv（仕込みレシピ）</span>
                <span>recipe_lines.csv（明細）</span>
              </div>
              <button className="primary-button" type="button" onClick={exportCsv}>
                <FileDown size={18} />
                CSVを出力
              </button>
              <button className="secondary-button" type="button" onClick={backupJson}>
                <Save size={18} />
                JSONバックアップ
              </button>
              <button className="secondary-button" type="button" onClick={() => importRef.current?.click()}>
                <CloudUpload size={18} />
                JSON復元
              </button>
              <input ref={importRef} className="hidden-input" type="file" accept="application/json" onChange={importJson} />
              <button className="secondary-button" type="button" onClick={() => csvImportRef.current?.click()}>
                <CloudUpload size={18} />
                Excel CSV取込
              </button>
              <input ref={csvImportRef} className="hidden-input" type="file" accept=".csv,text/csv" multiple onChange={importCsv} />
            </section>

            <section className="panel compact-panel">
              <SectionTitle>データ管理</SectionTitle>
              <div className="health-row">
                <span>最終更新</span>
                <b>{dateTimeText(data.meta.updatedAt)}</b>
              </div>
              <div className="health-row">
                <span>食材 / 販売 / 仕込み / 明細</span>
                <b>{data.ingredients.length} / {data.products.length} / {data.parts.length} / {data.lines.length}</b>
              </div>
              <button className="secondary-button" type="button" onClick={resetDemo}>
                <RotateCw size={18} />
                サンプルへ戻す
              </button>
            </section>
          </section>
        )}

        <nav className="bottom-nav" aria-label="SEN Mobile navigation">
          <button className={activeTab === "dashboard" ? "active" : ""} type="button" onClick={() => setActiveTab("dashboard")}>
            <Grid2X2 size={26} />
            <span>ダッシュボード</span>
          </button>
          <button className={activeTab === "recipes" ? "active" : ""} type="button" onClick={() => setActiveTab("recipes")}>
            <BookOpen size={26} />
            <span>レシピ</span>
          </button>
          <button className={activeTab === "ingredients" ? "active" : ""} type="button" onClick={() => setActiveTab("ingredients")}>
            <ShoppingBasket size={26} />
            <span>食材</span>
          </button>
          <button className={activeTab === "export" ? "active" : ""} type="button" onClick={() => setActiveTab("export")}>
            <FileDown size={26} />
            <span>出力</span>
          </button>
        </nav>
      </div>
    </main>
  );
}
