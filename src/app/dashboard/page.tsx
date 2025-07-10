'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, BarChart3, DollarSign, TrendingUp, TrendingDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface BalanceEntry {
  id: string;
  cuenta: string;
  descripcion: string;
  saldoFinal: number;
  entradas: number;
  salidas: number;
  fecha: string;
  tipo: 'SALDO' | 'LIQUIDEZ';
  categoria?: string;
  moneda: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<BalanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSaldos: 0,
    totalLiquidez: 0,
    entradesTotales: 0,
    salidasTotales: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setEntries(data.entries || []);

      // Calcular estadísticas
      const totalSaldos = data.entries
        ?.filter((e: BalanceEntry) => e.tipo === 'SALDO')
        .reduce((sum: number, e: BalanceEntry) => sum + e.saldoFinal, 0) || 0;

      const totalLiquidez = data.entries
        ?.filter((e: BalanceEntry) => e.tipo === 'LIQUIDEZ')
        .reduce((sum: number, e: BalanceEntry) => sum + e.saldoFinal, 0) || 0;

      const entradesTotales = data.entries
        ?.reduce((sum: number, e: BalanceEntry) => sum + e.entradas, 0) || 0;

      const salidasTotales = data.entries
        ?.reduce((sum: number, e: BalanceEntry) => sum + e.salidas, 0) || 0;

      setStats({
        totalSaldos,
        totalLiquidez,
        entradesTotales,
        salidasTotales,
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Saldos y Liquidez
              </h1>
              <p className="text-gray-600">Bienvenido, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Saldos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.totalSaldos)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Liquidez
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.totalLiquidez)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Entradas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.entradesTotales)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Salidas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.salidasTotales)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/upload')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              <span>Subir Excel</span>
            </Button>
            <Button
              onClick={() => router.push('/analytics')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Ver Analíticas</span>
            </Button>
          </div>
        </div>

        {/* Recent Data Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Datos Recientes</h2>
          </div>
          
          {entries.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No hay datos disponibles. Sube un archivo Excel para comenzar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuenta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Final
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.cuenta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entry.saldoFinal, entry.moneda)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.tipo === 'SALDO' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(new Date(entry.fecha))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}