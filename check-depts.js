const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const depts = await prisma.department.findMany()
    console.log('Departments:', JSON.stringify(depts, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
