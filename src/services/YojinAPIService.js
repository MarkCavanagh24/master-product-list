const axios = require('axios');
const config = require('../config');

class YojinAPIService {
  constructor() {
    this.baseURL = config.yojin.apiUrl;
    this.apiKey = config.yojin.apiKey;
    this.tenant = config.yojin.tenant;
    this.timeout = config.yojin.timeout;
    this.retryAttempts = config.yojin.retryAttempts;
    this.retryDelay = config.yojin.retryDelay;
  }

  async makeRequest(method, endpoint, data = null, merchantId = null) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Tenant': this.tenant,
    };

    if (merchantId) {
      headers['X-Merchant-ID'] = merchantId;
    }

    const requestConfig = {
      method,
      url,
      headers,
      timeout: this.timeout,
    };

    if (data) {
      requestConfig.data = data;
    }

    let lastError;
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios(requestConfig);
        
        // Check if response is HTML (indicates wrong endpoint)
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          throw new Error('API returned HTML page instead of JSON - check endpoint URL');
        }
        
        return response.data;
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Product Management Methods
  async createProduct(merchantId, productData) {
    const payload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      sku: productData.sku,
      category: productData.category,
      brand: productData.brand,
      weight: productData.weight,
      dimensions: productData.dimensions,
      image_url: productData.image_url,
      tags: productData.tags,
      is_active: productData.is_active
    };

    return await this.makeRequest('POST', '/products', payload, merchantId);
  }

  async updateProduct(merchantId, productId, productData) {
    const payload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      sku: productData.sku,
      category: productData.category,
      brand: productData.brand,
      weight: productData.weight,
      dimensions: productData.dimensions,
      image_url: productData.image_url,
      tags: productData.tags,
      is_active: productData.is_active
    };

    return await this.makeRequest('PUT', `/products/${productId}`, payload, merchantId);
  }

  async deleteProduct(merchantId, productId) {
    return await this.makeRequest('DELETE', `/products/${productId}`, null, merchantId);
  }

  async getProduct(merchantId, productId) {
    return await this.makeRequest('GET', `/products/${productId}`, null, merchantId);
  }

  async getProducts(merchantId, filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.brand) queryParams.append('brand', filters.brand);
    if (filters.search) queryParams.append('search', filters.search);

    const endpoint = `/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.makeRequest('GET', endpoint, null, merchantId);
  }

  async bulkCreateProducts(merchantId, products) {
    const payload = { products };
    return await this.makeRequest('POST', '/products/bulk', payload, merchantId);
  }

  async bulkUpdateProducts(merchantId, products) {
    const payload = { products };
    return await this.makeRequest('PUT', '/products/bulk', payload, merchantId);
  }

  async bulkDeleteProducts(merchantId, productIds) {
    const payload = { product_ids: productIds };
    return await this.makeRequest('DELETE', '/products/bulk', payload, merchantId);
  }

  // Merchant Management Methods
  async getMerchant(merchantId) {
    return await this.makeRequest('GET', `/merchants/${merchantId}`);
  }

  async getMerchants(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.status) queryParams.append('status', filters.status);

    const endpoint = `/merchants${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.makeRequest('GET', endpoint);
  }

  async createMerchant(merchantData) {
    const payload = {
      name: merchantData.name,
      email: merchantData.email,
      phone: merchantData.phone,
      address: merchantData.address
    };

    return await this.makeRequest('POST', '/merchants', payload);
  }

  async updateMerchant(merchantId, merchantData) {
    const payload = {
      name: merchantData.name,
      email: merchantData.email,
      phone: merchantData.phone,
      address: merchantData.address
    };

    return await this.makeRequest('PUT', `/merchants/${merchantId}`, payload);
  }

  // Helper Methods
  async testConnection() {
    try {
      const response = await this.makeRequest('GET', '/health');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getApiLimits() {
    try {
      const response = await this.makeRequest('GET', '/limits');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new YojinAPIService();
