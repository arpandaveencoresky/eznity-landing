// Custom hook for managing templates

import { useState, useEffect, useCallback } from 'react';
import { Template } from '../types';
import { apiService } from '../services/api';

interface UseTemplatesReturn {
  templates: Template[];
  selectedTemplate: Template | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  loadTemplates: () => Promise<void>;
  selectTemplate: (template: Template) => void;
  createTemplate: (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Template | null>;
  updateTemplate: (id: string, templateData: Partial<Template>) => Promise<Template | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  searchTemplates: (query: string) => Promise<void>;
  getTemplatesByCategory: (category: string) => Promise<void>;
}

export const useTemplates = (): UseTemplatesReturn => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all templates
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a template
  const selectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  // Create new template
  const createTemplate = useCallback(async (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template | null> => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await apiService.createTemplate(templateData);
      if (response.success) {
        const newTemplate = response.data;
        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setIsSaving(false);
    }
    
    return null;
  }, []);

  // Update existing template
  const updateTemplate = useCallback(async (id: string, templateData: Partial<Template>): Promise<Template | null> => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await apiService.updateTemplate(id, templateData);
      if (response.success) {
        const updatedTemplate = response.data;
        setTemplates(prev => prev.map(template => 
          template.id === id ? updatedTemplate : template
        ));
        
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(updatedTemplate);
        }
        
        return updatedTemplate;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    } finally {
      setIsSaving(false);
    }
    
    return null;
  }, [selectedTemplate]);

  // Delete template
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await apiService.deleteTemplate(id);
      if (response.success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(null);
        }
        
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setIsSaving(false);
    }
    
    return false;
  }, [selectedTemplate]);

  // Search templates
  const searchTemplates = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.searchTemplates(query);
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get templates by category
  const getTemplatesByCategory = useCallback(async (category: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getTemplatesByCategory(category);
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates by category');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    selectedTemplate,
    isLoading,
    isSaving,
    error,
    loadTemplates,
    selectTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    getTemplatesByCategory,
  };
};
