const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- PLAYLISTS DIAGNOSTIC ---')
    const playlists = await prisma.playlist.findMany({
        include: {
            access: {
                include: {
                    department: true
                }
            },
            videos: {
                include: {
                    video: true
                }
            }
        }
    })

    playlists.forEach(p => {
        console.log(`Playlist: ${p.title}`)
        console.log(`- ID: ${p.id}`)
        console.log(`- isPublished: ${p.isPublished}`)
        console.log(`- Access Count: ${p.access.length}`)
        p.access.forEach(a => {
            console.log(`  - Access Dept: ${a.department.name} (${a.department.code})`)
        })
        console.log(`- Videos Count: ${p.videos.length}`)
        p.videos.forEach(pv => {
            console.log(`  - Video: ${pv.video.title} (Published: ${pv.video.isPublished})`)
        })
        console.log('---------------------------')
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
