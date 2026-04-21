import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Products.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

const Products = () => {

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-page">

      {/* SEARCH BAR */}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* PRODUCT GRID */}

      <div className="products-grid">

        {filteredProducts.map((product) => (
          <Link
            to={`/products/${product._id}`}
            key={product._id}
            className="product-card"
          >

            <div className="image-wrapper">
              <img src={product.images[0]} alt={product.name} />
            </div>

            <div className="product-info">
              <p className="product-name">{product.name}</p>
              <p className="product-price">₹{product.price}</p>
            </div>

          </Link>
        ))}

      </div>

    </div>
  );
};

export default Products;