import type { Employee } from '@/store/useHRStore'

export type BankType = 'BCA' | 'MANDIRI' | 'BRI' | 'GENERIC_CSV'

export interface PayrollRecordForExport {
  employeeId: number
  name: string
  accountNumber: string
  bankName: string
  grossSalary: number
  netSalary: number
  taxDeduction: number
  bpjsDeduction: number
}

/**
 * Formats data and downloads a bank direct transfer batch file
 */
export function exportBankPayrollBatch(
  employees: Employee[],
  payrollNetMap: Record<number, number>,
  bankType: BankType,
  branchName: string = 'Senopati (HQ)'
) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const periodStr = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  
  let fileContent = ''
  let fileName = ''
  let mimeType = 'text/csv;charset=utf-8;'

  // Mock bank account numbers for demo
  const mockAccounts: Record<number, { bca: string, mandiri: string, bri: string }> = {
    1: { bca: '8045123981', mandiri: '1370019283741', bri: '034101002938531' },
    2: { bca: '8045981244', mandiri: '1370018472910', bri: '034101004829104' },
    3: { bca: '8045239102', mandiri: '1370017482913', bri: '034101003829182' },
    4: { bca: '8045719283', mandiri: '1370016482914', bri: '034101005829183' },
    5: { bca: '8045381920', mandiri: '1370015482915', bri: '034101006829184' }
  }

  if (bankType === 'BCA') {
    // BCA Corporate Payroll CSV format:
    // [No, Rekening Penerima, Nama Penerima, Nominal Transfer, Berita Transfer, Kode Transaksi]
    fileName = `BCA_PAYROLL_${branchName.replace(/\s+/g, '_')}_${dateStr}.csv`
    const rows = [
      ['NO', 'NO_REKENING', 'NAMA_PENERIMA', 'NOMINAL_IDR', 'BERITA_TRANSFER', 'KODE_CABANG']
    ]

    employees.forEach((emp, idx) => {
      const net = payrollNetMap[emp.id] || emp.baseSalary
      const acc = mockAccounts[emp.id]?.bca || `8045${String(emp.id).padStart(6, '0')}`
      rows.push([
        String(idx + 1),
        acc,
        emp.name,
        String(Math.round(net)),
        `Gaji Sokara ${periodStr}`,
        '0042'
      ])
    })

    fileContent = rows.map(r => r.join(',')).join('\r\n')
  } else if (bankType === 'MANDIRI') {
    // Mandiri MCM (Mandiri Cash Management) format:
    fileName = `MANDIRI_MCM_${branchName.replace(/\s+/g, '_')}_${dateStr}.csv`
    const rows = [
      ['BENEFICIARY_ACC', 'BENEFICIARY_NAME', 'AMOUNT', 'REMARK1', 'REMARK2', 'BENEFICIARY_EMAIL']
    ]

    employees.forEach((emp) => {
      const net = payrollNetMap[emp.id] || emp.baseSalary
      const acc = mockAccounts[emp.id]?.mandiri || `137001${String(emp.id).padStart(7, '0')}`
      rows.push([
        acc,
        emp.name,
        String(Math.round(net)),
        `GAJI SOKARA ${periodStr.toUpperCase()}`,
        `HRMS-${emp.id}`,
        `${emp.name.toLowerCase().replace(/\s+/g, '.')}@sokara.id`
      ])
    })

    fileContent = rows.map(r => r.join(',')).join('\r\n')
  } else if (bankType === 'BRI') {
    // BRI Mass Transfer CSV format:
    fileName = `BRI_MASS_PAYROLL_${branchName.replace(/\s+/g, '_')}_${dateStr}.csv`
    const rows = [
      ['REK_TUJUAN', 'NAMA_TUJUAN', 'NOMINAL', 'KETERANGAN', 'TANGGAL_PROSES']
    ]

    employees.forEach((emp) => {
      const net = payrollNetMap[emp.id] || emp.baseSalary
      const acc = mockAccounts[emp.id]?.bri || `03410100${String(emp.id).padStart(7, '0')}`
      rows.push([
        acc,
        emp.name,
        String(Math.round(net)),
        `Payroll Sokara ${periodStr}`,
        dateStr
      ])
    })

    fileContent = rows.map(r => r.join(',')).join('\r\n')
  } else {
    // Generic Full HRMS Payroll Ledger CSV
    fileName = `SOKARA_PAYROLL_LEDGER_${branchName.replace(/\s+/g, '_')}_${dateStr}.csv`
    const rows = [
      ['ID', 'NAMA', 'ROLE', 'DEPT', 'PTKP', 'KAT_TER', 'GAJI_POKOK', 'RATE_PER_JAM', 'LEMBUR_JAM', 'SHIFT_MALAM', 'TOTAL_NETTO_IDR']
    ]

    employees.forEach((emp) => {
      const net = payrollNetMap[emp.id] || emp.baseSalary
      rows.push([
        String(emp.id),
        emp.name,
        emp.role,
        emp.dept,
        emp.ptkp,
        emp.kat,
        String(emp.baseSalary),
        String(emp.rate),
        String(emp.overtimeHours),
        String(emp.nightShiftsMonth),
        String(Math.round(net))
      ])
    })

    fileContent = rows.map(r => r.join(',')).join('\r\n')
  }

  // Trigger browser download
  const blob = new Blob([fileContent], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
