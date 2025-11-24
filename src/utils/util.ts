export type FetchOptions = {
	baseUrl?: string
	token?: string
}

export type EmployeeData = {
	id: number
	name: string
	email: string
}

export type SalaryRecordDTO = {
	month: string
	amount: number
	paidOn: string
}


async function apiFetch<T>(path: string, opts?: FetchOptions): Promise<T> {
	const base = opts?.baseUrl ?? ''
	const url = `${base}${path}`
	const headers: Record<string,string> = { 'Content-Type': 'application/json' }

	const token = opts?.token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null)
	if (token) headers['Authorization'] = `Bearer ${token}`

	const res = await fetch(url, { headers })
	if (!res.ok) {
		const text = await res.text().catch(()=>res.statusText)
		throw new Error(`Request failed ${res.status}: ${text}`)
	}
	return res.json() as Promise<T>
}

export async function fetchEmployeeByEmail(email: string, opts?: FetchOptions): Promise<EmployeeData> {
	// Example backend endpoint: /api/employees?email=...
	const q = encodeURIComponent(email.trim())
	return apiFetch<EmployeeData>(`/api/employees?email=${q}`, opts)
}

export async function fetchSalaryHistory(employeeId: number, opts?: FetchOptions): Promise<SalaryRecordDTO[]> {
	// Example backend endpoint: /api/employees/:id/salary
	return apiFetch<SalaryRecordDTO[]>(`/api/employees/${employeeId}/salary`, opts)
}

export default { fetchEmployeeByEmail, fetchSalaryHistory }

