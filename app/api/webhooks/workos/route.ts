import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('workos-signature');
  const secret = process.env.WORKOS_WEBHOOK_SECRET!;
  
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  if (hash !== signature) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = JSON.parse(body);
  const supabase = createClient();
  
  switch (event.event) {
    case 'user.created':
    case 'user.updated':
      await (await supabase)
        .from('users')
        .upsert({
          workos_user_id: event.data.id,
          email: event.data.email,
          first_name: event.data.first_name,
          last_name: event.data.last_name,
          updated_at: new Date().toISOString(),
        });
      break;
      
    case 'user.deleted':
      await (await supabase)
        .from('users')
        .delete()
        .eq('workos_user_id', event.data.id);
      break;
  }
  
  return new Response('OK', { status: 200 });
}