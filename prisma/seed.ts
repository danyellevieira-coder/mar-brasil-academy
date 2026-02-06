import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/lib/auth'

async function seed() {
  console.log('🌱 Seeding database...')

  // Criar departamentos
  // PÚBLICO é especial - vídeos marcados com este departamento ficam acessíveis a todos (inclusive convidados)
  const departmentsData = [
    { name: '🌐 Público (Todos)', code: 'PUBLICO' },  // Departamento especial - NÃO DELETAR
    { name: 'Recursos Humanos', code: 'RH2024' },
    { name: 'Tecnologia da Informação', code: 'TI2024' },
    { name: 'Licitações', code: 'LIC2024' },
    { name: 'Departamento Jurídico', code: 'JUR2024' },
    { name: 'Mídias Sociais', code: 'MID2024' },
    { name: 'Diretoria', code: 'DIR2024' },
    { name: 'Operacional', code: 'OPE2024' },
  ]

  const departments: Record<string, string> = {}
  
  for (const dept of departmentsData) {
    const created = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
    departments[dept.code] = created.id
  }
  console.log('✅ Departamentos criados:', Object.keys(departments).join(', '))

  // Criar usuário Admin/SuperUser
  const adminPassword = await hashPassword('Admin@123')
  await prisma.user.upsert({
    where: { email: 'admin@marbrasil.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@marbrasil.com',
      password: adminPassword,
      role: 'ADMIN',
      isSuperUser: true,
    },
  })
  console.log('✅ Admin criado: admin@marbrasil.com / Admin@123')

  // Criar usuário Worker - TI
  const workerTIPassword = await hashPassword('Worker@123')
  const workerTI = await prisma.user.upsert({
    where: { email: 'ti@marbrasil.com' },
    update: {},
    create: {
      name: 'João da TI',
      email: 'ti@marbrasil.com',
      password: workerTIPassword,
      role: 'WORKER',
      isSuperUser: false,
    },
  })
  // Vincular ao departamento TI
  await prisma.userDepartment.upsert({
    where: { userId_departmentId: { userId: workerTI.id, departmentId: departments['TI2024'] } },
    update: {},
    create: { userId: workerTI.id, departmentId: departments['TI2024'] }
  })
  console.log('✅ Worker TI: ti@marbrasil.com / Worker@123 (Departamento: TI)')

  // Criar usuário Worker - RH
  const workerRHPassword = await hashPassword('Worker@123')
  const workerRH = await prisma.user.upsert({
    where: { email: 'rh@marbrasil.com' },
    update: {},
    create: {
      name: 'Maria do RH',
      email: 'rh@marbrasil.com',
      password: workerRHPassword,
      role: 'WORKER',
      isSuperUser: false,
    },
  })
  // Vincular ao departamento RH
  await prisma.userDepartment.upsert({
    where: { userId_departmentId: { userId: workerRH.id, departmentId: departments['RH2024'] } },
    update: {},
    create: { userId: workerRH.id, departmentId: departments['RH2024'] }
  })
  console.log('✅ Worker RH: rh@marbrasil.com / Worker@123 (Departamento: RH)')

  // Criar usuário Cliente
  const customerPassword = await hashPassword('Cliente@123')
  await prisma.user.upsert({
    where: { email: 'cliente@empresa.com' },
    update: {},
    create: {
      name: 'Cliente Exemplo',
      email: 'cliente@empresa.com',
      password: customerPassword,
      role: 'CUSTOMER',
      isSuperUser: false,
    },
  })
  console.log('✅ Cliente: cliente@empresa.com / Cliente@123')

  console.log('\n🎉 Seed concluído!')
  console.log('\n📋 Resumo dos usuários de teste:')
  console.log('┌─────────────────────────────────┬─────────────┬──────────────┐')
  console.log('│ Email                           │ Senha       │ Tipo         │')
  console.log('├─────────────────────────────────┼─────────────┼──────────────┤')
  console.log('│ admin@marbrasil.com             │ Admin@123   │ Super Admin  │')
  console.log('│ ti@marbrasil.com                │ Worker@123  │ Worker (TI)  │')
  console.log('│ rh@marbrasil.com                │ Worker@123  │ Worker (RH)  │')
  console.log('│ cliente@empresa.com             │ Cliente@123 │ Cliente      │')
  console.log('└─────────────────────────────────┴─────────────┴──────────────┘')
}

seed()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
