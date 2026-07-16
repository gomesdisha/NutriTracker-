import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, Sparkles, BookOpen, Globe } from "lucide-react";

// Curated list of raw Indian cooking ingredients with ICMR/NIN nutritional values
const LOCAL_INDIAN_INGREDIENTS = [
  {
    _id: "local-ragi",
    name: "Ragi (Finger Millet) - Raw",
    brand: "Local Indian Crop",
    energy: 328,
    protein: 7.3,
    carbs: 72.0,
    fat: 1.3,
    category: "Millets",
    desc: "Super-rich in Calcium (344mg/100g) and dietary fiber. Highly recommended to reverse stunting in children."
  },
  {
    _id: "local-rice",
    name: "Rice (White Raw)",
    brand: "Cereals",
    energy: 345,
    protein: 6.8,
    carbs: 78.2,
    fat: 0.5,
    category: "Cereals",
    desc: "Energy-dense carbohydrate staple. Forms the calorie base of Anganwadi Hot Cooked Meals (HCM)."
  },
  {
    _id: "local-dal",
    name: "Moong / Masoor Dal (Split Red Lentils) - Raw",
    brand: "Pulses",
    energy: 343,
    protein: 24.5,
    carbs: 59.9,
    fat: 1.2,
    category: "Pulses",
    desc: "Excellent source of plant protein. Essential building block for muscle recovery and reversing stunting."
  },
  {
    _id: "local-milk",
    name: "Cow Milk (Whole)",
    brand: "Dairy",
    energy: 62,
    protein: 3.2,
    carbs: 4.7,
    fat: 3.5,
    category: "Dairy",
    desc: "Rich in calcium, phosphorus, and high-quality protein to support linear height development."
  },
  {
    _id: "local-egg",
    name: "Chicken Egg (Whole Raw)",
    brand: "Poultry",
    energy: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5,
    category: "Poultry",
    desc: "Reference protein source containing all essential amino acids. Supports healthy growth velocity."
  },
  {
    _id: "local-jaggery",
    name: "Jaggery (Gur) - Raw",
    brand: "Sweeteners",
    energy: 383,
    protein: 0.4,
    carbs: 95.0,
    fat: 0.1,
    category: "Sweeteners",
    desc: "Contains natural iron (2.6mg/100g) and minerals. Recommended to combat anemia and underweight."
  },
  {
    _id: "local-soya",
    name: "Soya Chunks (Dehydrated)",
    brand: "Protein Concentrates",
    energy: 345,
    protein: 52.0,
    carbs: 33.0,
    fat: 0.5,
    category: "Protein",
    desc: "High protein density (52%). Highly affordable vegetarian option for fast weight gain."
  },
  {
    _id: "local-spinach",
    name: "Spinach (Palak) - Fresh Leaves",
    brand: "Green Leafy Vegetables",
    energy: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    category: "Vegetables",
    desc: "Rich in Iron, Folate, and Vitamin A. Essential for visual health and preventing anemia."
  },
  {
    _id: "local-banana",
    name: "Banana (Musa) - Fresh Ripe",
    brand: "Fresh Fruits",
    energy: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    category: "Fruits",
    desc: "Highly digestible, rich in potassium and Vitamin B6. Boosts active energy levels."
  },
  {
    _id: "local-kichdi",
    name: "Anganwadi Kichdi (Rice + Pulse Mix Cooked)",
    brand: "Standard Meal Recipes",
    energy: 120,
    protein: 4.5,
    carbs: 22.0,
    fat: 2.0,
    category: "Recipes",
    desc: "Perfect amino acid profile. Gentle on children's stomachs, suitable for convalescent care."
  }
];

export default function FoodGuide() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [error, setError] = useState("");

  const indianSuggestions = ["Ragi", "Kichdi", "Dal", "Paneer", "Egg", "Banana"];

  // Perform search
  async function searchFood(searchTerm) {
    if (!searchTerm.trim()) {
      setResults(LOCAL_INDIAN_INGREDIENTS);
      setIsGlobalSearch(false);
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    // 1. First, search local Indian raw ingredients database
    const localMatches = LOCAL_INDIAN_INGREDIENTS.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (localMatches.length > 0) {
      setResults(localMatches);
      setIsGlobalSearch(false);
      setLoading(false);
      return;
    }

    // 2. If no local matches, fall back to global OpenFoodFacts API
    await searchGlobalAPI(searchTerm);
  }

  async function searchGlobalAPI(searchTerm) {
    setIsGlobalSearch(true);
    setLoading(true);
    setError("");
    try {
      const apiKey = "fn_Sg8ZhtUqVzMNh7ifq6HccqE3xcsPD2wQKnLir-MNbB0";
      const res = await fetch(
        `https://calorieapiadmin.com/api/v1/search/foods?q=${encodeURIComponent(searchTerm.trim())}`,
        {
          headers: {
            "X-API-Key": apiKey
          }
        }
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      
      const mapped = (data.data || []).map((product) => {
        return {
          _id: product.id,
          name: product.name,
          brand: product.brand_name || "Generic",
          image: null,
          energy: Math.round(product.calories_100g || 0),
          protein: Number(product.protein_100g || 0).toFixed(1),
          carbs: Number(product.carbs_100g || 0).toFixed(1),
          fat: Number(product.fat_100g || 0).toFixed(1),
          category: product.category_name || "Global",
          desc: product.description || "Nutrient details from Calorie API."
        };
      });

      setResults(mapped);
      if (mapped.length === 0) {
        setError(`No local or Calorie API matches found for "${searchTerm}".`);
      }
    } catch (err) {
      setError("Failed to fetch food details from Calorie API. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    searchFood(query);
  }

  // Load defaults or parse query param
  useEffect(() => {
    const term = searchParams.get("search");
    if (term) {
      setQuery(term);
      searchFood(term);
    } else {
      setResults(LOCAL_INDIAN_INGREDIENTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center gap-2 mb-3">
        <BookOpen className="text-teal-700" size={24} />
        <div>
          <h4 className="mb-0 fw-bold text-slate-900">Poshan Reference Guide</h4>
          <small className="text-muted">Lookup raw Indian ingredients and WHO nutrition values (ICMR Standard)</small>
        </div>
      </div>

      <div className="card nt-card mb-4 border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={18} />
              </span>
              <input
                className="form-control border-start-0 ps-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search raw ingredients (e.g. Ragi, Moong Dal, Egg, Spinach...)"
              />
            </div>
            <button className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </form>
          
          <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
            <span className="small text-muted fw-semibold">Quick suggestions:</span>
            {indianSuggestions.map((food) => (
              <button
                key={food}
                type="button"
                className="btn btn-xs btn-outline-teal px-2 py-1 fs-8 rounded-pill fw-medium"
                onClick={() => {
                  setQuery(food);
                  searchFood(food);
                }}
              >
                {food}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary px-2 py-1 fs-8 rounded-pill ms-auto fw-medium d-flex align-items-center gap-1"
              onClick={() => searchGlobalAPI(query || "rice")}
              disabled={loading}
            >
              <Globe size={11} />
              Force Global Search
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-warning py-3 rounded-3">{error}</div>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-slate-800">
          {isGlobalSearch ? "OpenFoodFacts Global Database Matches" : "ICMR Standard Raw Ingredients"} ({results.length})
        </h6>
        {!isGlobalSearch && (
          <span className="badge bg-success-subtle text-success border border-success-subtle">
            ✓ Offline Available
          </span>
        )}
      </div>

      <div className="row g-3">
        {results.map((product) => {
          const name = product.name;
          const brand = product.brand;
          const image = product.image;

          return (
            <div className="col-12 col-lg-6" key={product._id}>
              <div className="card nt-card h-100 border-0 shadow-sm">
                <div className="card-body p-3 d-flex gap-3 align-items-start">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "10px" }}
                      className="border"
                    />
                  ) : (
                    <div
                      className="bg-teal-50 border border-teal-100 text-teal-700 d-flex align-items-center justify-content-center"
                      style={{ width: 80, height: 80, borderRadius: "10px" }}
                    >
                      <Sparkles size={24} />
                    </div>
                  )}

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <h6 className="fw-bold mb-1 text-truncate text-slate-900">{name}</h6>
                      <span className="badge poshan-category-tag">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-muted small mb-2">{brand} • Values per 100g/ml</div>
                    <p className="text-slate-600 mb-3" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                      {product.desc}
                    </p>

                    <div className="row g-2">
                      <div className="col-6 col-md-3">
                        <div className="bg-light p-2 rounded text-center">
                          <div className="text-muted fs-8 fw-semibold uppercase">Calories</div>
                          <div className="fw-bold text-slate-800 fs-7">{product.energy} kcal</div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="bg-light p-2 rounded text-center">
                          <div className="text-muted fs-8 fw-semibold uppercase">Protein</div>
                          <div className="fw-bold text-success fs-7">{product.protein}g</div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="bg-light p-2 rounded text-center">
                          <div className="text-muted fs-8 fw-semibold uppercase">Carbs</div>
                          <div className="fw-bold text-info fs-7">{product.carbs}g</div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="bg-light p-2 rounded text-center">
                          <div className="text-muted fs-8 fw-semibold uppercase">Fats</div>
                          <div className="fw-bold text-warning fs-7">{product.fat}g</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
