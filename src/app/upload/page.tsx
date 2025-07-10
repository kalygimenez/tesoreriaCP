'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadResult {
  success: boolean;
  message: string;
  entriesCount?: number;
  errors?: string[];
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (isExcelFile(file)) {
        setFile(file);
        setUploadResult(null);
      } else {
        setUploadResult({
          success: false,
          message: 'Por favor selecciona un archivo Excel (.xlsx, .xls)',
        });
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (isExcelFile(file)) {
        setFile(file);
        setUploadResult(null);
      } else {
        setUploadResult({
          success: false,
          message: 'Por favor selecciona un archivo Excel (.xlsx, .xls)',
        });
      }
    }
  };

  const isExcelFile = (file: File) => {
    return file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
           file.type === 'application/vnd.ms-excel' ||
           file.name.endsWith('.xlsx') ||
           file.name.endsWith('.xls');
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message,
          entriesCount: result.entriesCount,
        });
        setFile(null);
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Error al procesar el archivo',
          errors: result.errors,
        });
      }

    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Error de conexión al subir el archivo',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="mr-4 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Subir Archivo Excel
              </h1>
              <p className="text-gray-600">
                Carga tus datos de saldos y liquidez desde un archivo Excel
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Formato de Archivo Esperado
          </h2>
          <div className="text-blue-800 space-y-2">
            <p>• El archivo debe ser un Excel (.xlsx o .xls)</p>
            <p>• Debe contener las siguientes columnas:</p>
            <div className="ml-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <span>- Cuenta o Account</span>
              <span>- Descripción o Description</span>
              <span>- Saldo Inicial</span>
              <span>- Saldo Final</span>
              <span>- Entradas o Débitos</span>
              <span>- Salidas o Créditos</span>
              <span>- Fecha (opcional)</span>
              <span>- Moneda (opcional, por defecto ARS)</span>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-green-600" />
                <div>
                  <p className="text-lg font-medium text-green-900">{file.name}</p>
                  <p className="text-green-700">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUploading ? 'Procesando...' : 'Procesar Archivo'}
                  </Button>
                  <Button
                    onClick={() => setFile(null)}
                    variant="outline"
                    disabled={isUploading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Arrastra tu archivo Excel aquí
                  </p>
                  <p className="text-gray-600">o haz clic para seleccionar</p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <Button
                  onClick={() => document.getElementById('file-input')?.click()}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Seleccionar Archivo</span>
                </Button>
              </div>
            )}
          </div>

          {/* Results */}
          {uploadResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              uploadResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    uploadResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {uploadResult.message}
                  </p>
                  {uploadResult.entriesCount && (
                    <p className="text-green-700 mt-1">
                      Se procesaron {uploadResult.entriesCount} registros exitosamente.
                    </p>
                  )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-800 font-medium">Errores encontrados:</p>
                      <ul className="text-red-700 text-sm mt-1 ml-4">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {uploadResult.success && (
                    <div className="mt-4">
                      <Button
                        onClick={() => router.push('/dashboard')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Ver Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}