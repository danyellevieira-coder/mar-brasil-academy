const { PrismaClient } = require('@prisma/client')

async function test() {
    const prisma = new PrismaClient()
    try {
        console.log('Testing connection...')
        const user = await prisma.user.findFirst()
        console.log('User found:', user ? user.email : 'None')

        console.log('Attempting to create a test video...')
        const video = await prisma.video.create({
            data: {
                title: 'Test Video Connection',
                youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                isPublished: false
            }
        })
        console.log('Video created successfully:', video.id)

        // Clean up
        await prisma.video.delete({ where: { id: video.id } })
        console.log('Video deleted successfully')

    } catch (error) {
        console.error('DATABASE ERROR:', error)
    } finally {
        await prisma.$disconnect()
    }
}

test()
