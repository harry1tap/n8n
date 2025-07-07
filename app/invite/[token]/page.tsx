import { InviteAcceptForm } from "@/components/auth/invite-accept-form"
import { InvitationService } from "@/lib/auth/invitation-service"
import { notFound } from "next/navigation"
import Image from "next/image"

interface InvitePageProps {
  params: {
    token: string
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  try {
    const invitation = await InvitationService.getInvitationByToken(params.token)

    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image src="/skywide-logo.svg" alt="SKYWIDE Logo" width={300} height={90} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Invitation</h1>
            <p className="text-gray-300">You've been invited to join SKYWIDE as a {invitation.role}</p>
          </div>
          <InviteAcceptForm token={params.token} email={invitation.email} role={invitation.role} />
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
