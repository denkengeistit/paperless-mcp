export class PaperlessAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}/api${path}`
    const headers = {
      Authorization: `Token ${this.token}`,
      Accept: 'application/json; version=5',
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9'
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    if (!response.ok) {
      console.error({
        error: 'Error executing request',
        url,
        options,
        status: response.status,
        response: await response.json()
      })
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Document operations
  async bulkEditDocuments(documents, method, parameters = {}) {
    return this.request('/documents/bulk_edit/', {
      method: 'POST',
      body: JSON.stringify({
        documents,
        method,
        parameters
      })
    })
  }

  async postDocument(file, metadata = {}) {
    const formData = new FormData()
    formData.append('document', file)

    // Add optional metadata fields
    if (metadata.title) formData.append('title', metadata.title)
    if (metadata.created) formData.append('created', metadata.created)
    if (metadata.correspondent)
      formData.append('correspondent', metadata.correspondent)
    if (metadata.document_type)
      formData.append('document_type', metadata.document_type)
    if (metadata.storage_path)
      formData.append('storage_path', metadata.storage_path)
    if (metadata.tags) {
      metadata.tags.forEach(tag => formData.append('tags', tag))
    }
    if (metadata.archive_serial_number) {
      formData.append('archive_serial_number', metadata.archive_serial_number)
    }
    if (metadata.custom_fields) {
      metadata.custom_fields.forEach(field =>
        formData.append('custom_fields', field)
      )
    }

    const response = await fetch(
      `${this.baseUrl}/api/documents/post_document/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.token}`
        },
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getDocuments(query = '') {
    // Build the base URL with the query
    const baseQueryUrl = query ? `/documents/${query}` : '/documents/';
    
    // Parse the query to see if it already contains pagination parameters
    const hasExistingParams = query.includes('?');
    const pageParamPrefix = hasExistingParams ? '&' : '?';
    
    // Implement pagination to fetch all documents
    let allDocuments = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const paginatedUrl = `${baseQueryUrl}${pageParamPrefix}page=${page}&page_size=100`;
      const response = await this.request(paginatedUrl);
      
      if (response.results && response.results.length > 0) {
        allDocuments = [...allDocuments, ...response.results];
        
        // Check if there are more pages
        if (response.next) {
          page++;
        } else {
          hasMorePages = false;
        }
      } else {
        hasMorePages = false;
      }
    }
    
    return { count: allDocuments.length, results: allDocuments };
  }

  async getDocument(id) {
    return this.request(`/documents/${id}/`)
  }

  async searchDocuments(query) {
    return this.request(`/documents/?query=${encodeURIComponent(query)}`)
  }

  async downloadDocument(id, asOriginal = false) {
    const query = asOriginal ? '?original=true' : ''
    const response = await fetch(
      `${this.baseUrl}/api/documents/${id}/download/${query}`,
      {
        headers: {
          Authorization: `Token ${this.token}`
        }
      }
    )
    return response
  }

  // Tag operations
  async getTags() {
    return this.request('/tags/')
  }

  async createTag(data) {
    return this.request('/tags/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTag(id, data) {
    return this.request(`/tags/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteTag(id) {
    return this.request(`/tags/${id}/`, {
      method: 'DELETE'
    })
  }

  // Correspondent operations
  async getCorrespondents() {
    // Implement pagination to fetch all correspondents
    let allCorrespondents = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const response = await this.request(`/correspondents/?page=${page}&page_size=100`);
      
      if (response.results && response.results.length > 0) {
        allCorrespondents = [...allCorrespondents, ...response.results];
        
        // Check if there are more pages
        if (response.next) {
          page++;
        } else {
          hasMorePages = false;
        }
      } else {
        hasMorePages = false;
      }
    }
    
    return { count: allCorrespondents.length, results: allCorrespondents };
  }

  async createCorrespondent(data) {
    return this.request('/correspondents/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Document type operations
  async getDocumentTypes() {
    // Implement pagination to fetch all document types
    let allDocumentTypes = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const response = await this.request(`/document_types/?page=${page}&page_size=100`);
      
      if (response.results && response.results.length > 0) {
        allDocumentTypes = [...allDocumentTypes, ...response.results];
        
        // Check if there are more pages
        if (response.next) {
          page++;
        } else {
          hasMorePages = false;
        }
      } else {
        hasMorePages = false;
      }
    }
    
    return { count: allDocumentTypes.length, results: allDocumentTypes };
  }

  async createDocumentType(data) {
    return this.request('/document_types/', {
      method: 'POST',
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Bulk object operations
  async bulkEditObjects(objects, objectType, operation, parameters = {}) {
    return this.request('/bulk_edit_objects/', {
      method: 'POST',
      body: JSON.stringify({
        objects,
        object_type: objectType,
        operation,
        ...parameters
      })
    })
  }
}
