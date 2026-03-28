import { useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    color: "",
    images: "", // String of comma-separated URLs
    isFeatured: false,
  });

  const [sizeStock, setSizeStock] = useState<{ [key: string]: number }>({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleStockChange = (size: string, amount: number) => {
    setSizeStock((prev) => ({
      ...prev,
      [size]: Math.max(0, prev[size] + amount),
    }));
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const productData = {
        ...product,
        images: product.images.split(",").map((url) => url.trim()),
        sizes: Object.keys(sizeStock).filter(size => sizeStock[size] > 0),
        sizeStock: sizeStock,
      };

      await axios.post("https://preppy-back-end.onrender.com/api/products", productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product saved successfully! 🔥");
      // Reset form
      setProduct({
        name: "",
        description: "",
        price: 0,
        category: "",
        color: "",
        images: "",
        isFeatured: false,
      });
      setSizeStock({ S: 0, M: 0, L: 0, XL: 0 });
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save product. Check console.");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Add New Product to Database</p>

        <form onSubmit={saveProduct} className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              required
              placeholder="e.g. Doctor sleeve - cybersigil(1)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={product.color}
                onChange={handleInputChange}
                placeholder="e.g. Black"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleInputChange}
              required
              placeholder="e.g. Sleeves"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Image URLs (comma separated)</label>
            <input
              type="text"
              name="images"
              value={product.images}
              onChange={handleInputChange}
              placeholder="https://image1.com, https://image2.com"
            />
          </div>

          <div className="size-stock-section">
            <label>Size & Inventory</label>
            <div className="size-grid">
              {Object.keys(sizeStock).map((size) => (
                <div key={size} className="size-counter">
                  <span className="size-label">{size}</span>
                  <div className="counter-controls">
                    <button type="button" onClick={() => handleStockChange(size, -1)}>-</button>
                    <span>{sizeStock[size]}</span>
                    <button type="button" onClick={() => handleStockChange(size, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="featured-toggle">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={product.isFeatured}
              onChange={handleInputChange}
            />
            <label htmlFor="isFeatured">Mark as Featured Product</label>
          </div>

          <button type="submit" className="save-btn">SAVE PRODUCT</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
