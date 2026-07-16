import { AuthGate } from './_components/auth-gate'
import { AdminShell } from './_components/admin-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGate>
			<AdminShell>{children}</AdminShell>
		</AuthGate>
	)
}
