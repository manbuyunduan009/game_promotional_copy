type AdminProfile = {
  id: string
  role: string | null
}

export function getBearerToken(header: string | undefined) {
  if (!header?.startsWith('Bearer ')) return null

  const token = header.slice('Bearer '.length).trim()
  return token || null
}

export function isAdminProfile(profile: AdminProfile | null) {
  return profile?.role === 'admin'
}
