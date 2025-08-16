import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook para gerenciar autenticação
 * Extrai toda lógica de auth do AuthContext
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken, removeToken] = useLocalStorage('token', null);
  const [userData, setUserData, removeUserData] = useLocalStorage('user', null);

  // Sincronizar estado local com localStorage
  useEffect(() => {
    if (userData && token) {
      setUser(userData);
    }
    setLoading(false);
  }, [userData, token]);

  // Verificar validade do token ao inicializar
  useEffect(() => {
    const validateToken = async () => {
      if (token && userData) {
        try {
          // Verificar se o token ainda é válido
          await authAPI.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Token inválido:', error);
          logout();
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []); // Executar apenas uma vez ao montar

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      const { token: newToken, user: newUser } = response.data;

      // Salvar no localStorage através dos hooks
      setToken(newToken);
      setUserData(newUser);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login'
      };
    } finally {
      setLoading(false);
    }
  }, [setToken, setUserData]);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data;

      // Salvar no localStorage através dos hooks
      setToken(newToken);
      setUserData(newUser);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar conta'
      };
    } finally {
      setLoading(false);
    }
  }, [setToken, setUserData]);

  const logout = useCallback(() => {
    removeToken();
    removeUserData();
    setUser(null);
  }, [removeToken, removeUserData]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      setUserData(updatedUser);
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar perfil'
      };
    }
  }, [setUserData]);

  const hasPermission = useCallback((requiredRoles) => {
    if (!user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.role);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await authAPI.getProfile();
      const refreshedUser = response.data.user;
      
      setUserData(refreshedUser);
      setUser(refreshedUser);
      
      return refreshedUser;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      logout();
    }
  }, [token, setUserData, logout]);

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    refreshProfile,
    isAuthenticated: !!token && !!user,
  };
};