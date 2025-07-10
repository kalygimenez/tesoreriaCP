import * as XLSX from 'xlsx';

export interface ExcelData {
  cuenta: string;
  descripcion: string;
  saldoInicial: number;
  saldoFinal: number;
  entradas: number;
  salidas: number;
  fecha: Date;
  tipo: 'SALDO' | 'LIQUIDEZ';
  categoria?: string;
  moneda: string;
}

export function parseExcelFile(buffer: Buffer): ExcelData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir la hoja a JSON
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
  return rawData.map((row, index) => {
    try {
      // Mapear columnas comunes de Excel financiero
      // Puedes ajustar estos nombres según el formato de tu Excel
      const cuenta = row['Cuenta'] || row['Account'] || row['Código'] || `CUENTA_${index}`;
      const descripcion = row['Descripción'] || row['Description'] || row['Detalle'] || '';
      const saldoInicial = parseFloat(row['Saldo Inicial'] || row['Initial Balance'] || row['Saldo_Inicial'] || 0);
      const saldoFinal = parseFloat(row['Saldo Final'] || row['Final Balance'] || row['Saldo_Final'] || 0);
      const entradas = parseFloat(row['Entradas'] || row['Débitos'] || row['Debits'] || 0);
      const salidas = parseFloat(row['Salidas'] || row['Créditos'] || row['Credits'] || 0);
      
      // Fecha - intentar diferentes formatos
      let fecha: Date;
      const fechaRaw = row['Fecha'] || row['Date'] || row['Fecha_Registro'];
      if (fechaRaw) {
        if (fechaRaw instanceof Date) {
          fecha = fechaRaw;
        } else if (typeof fechaRaw === 'string') {
          fecha = new Date(fechaRaw);
        } else if (typeof fechaRaw === 'number') {
          // Excel serial date
          fecha = new Date((fechaRaw - 25569) * 86400 * 1000);
        } else {
          fecha = new Date();
        }
      } else {
        fecha = new Date();
      }
      
      // Determinar tipo basado en contenido o nombre de la hoja
      const sheetNameLower = sheetName.toLowerCase();
      let tipo: 'SALDO' | 'LIQUIDEZ' = 'SALDO';
      if (sheetNameLower.includes('liquidez') || sheetNameLower.includes('liquidity') || 
          sheetNameLower.includes('flujo') || sheetNameLower.includes('cash')) {
        tipo = 'LIQUIDEZ';
      }
      
      const categoria = row['Categoría'] || row['Category'] || row['Tipo'] || undefined;
      const moneda = row['Moneda'] || row['Currency'] || 'ARS';
      
      return {
        cuenta,
        descripcion,
        saldoInicial: isNaN(saldoInicial) ? 0 : saldoInicial,
        saldoFinal: isNaN(saldoFinal) ? 0 : saldoFinal,
        entradas: isNaN(entradas) ? 0 : entradas,
        salidas: isNaN(salidas) ? 0 : salidas,
        fecha: isNaN(fecha.getTime()) ? new Date() : fecha,
        tipo,
        categoria,
        moneda
      };
    } catch (error) {
      console.error('Error procesando fila:', error);
      return {
        cuenta: `ERROR_${index}`,
        descripcion: 'Error al procesar',
        saldoInicial: 0,
        saldoFinal: 0,
        entradas: 0,
        salidas: 0,
        fecha: new Date(),
        tipo: 'SALDO' as const,
        moneda: 'ARS'
      };
    }
  }).filter(item => item.cuenta !== '' && item.cuenta !== `ERROR_${rawData.length}`);
}

export function validateExcelStructure(buffer: Buffer): { valid: boolean; errors: string[] } {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    if (workbook.SheetNames.length === 0) {
      return { valid: false, errors: ['El archivo Excel no contiene hojas'] };
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return { valid: false, errors: ['La hoja Excel está vacía'] };
    }
    
    // Verificar si tiene columnas básicas
    const firstRow = data[0] as any;
    const headers = Object.keys(firstRow);
    
    const hasFinancialData = headers.some(header => 
      header.toLowerCase().includes('saldo') ||
      header.toLowerCase().includes('balance') ||
      header.toLowerCase().includes('cuenta') ||
      header.toLowerCase().includes('account')
    );
    
    if (!hasFinancialData) {
      return { 
        valid: false, 
        errors: ['El archivo no parece contener datos financieros. Verifique que tenga columnas como "Cuenta", "Saldo", etc.'] 
      };
    }
    
    return { valid: true, errors: [] };
  } catch (error) {
    return { valid: false, errors: [`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`] };
  }
}