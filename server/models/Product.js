const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    sizes: [{ type: String }], // Keeping this for backward compatibility and quick display
    
    // Track stock for each size individually
    // Example: { "S": 10, "M": 5, "L": 0 }
    sizeStock: {
      type: Map,
      of: Number,
      default: {}
    },
    
    // Total products sold
    salesCount: { 
      type: Number, 
      default: 0 
    },
    
    color: { type: String, default: "" },
    
    category: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual for total stock across all sizes
productSchema.virtual('totalStock').get(function() {
  let total = 0;
  if (this.sizeStock) {
    for (let count of this.sizeStock.values()) {
      total += count;
    }
  }
  return total;
});

module.exports = mongoose.model("Product", productSchema);
