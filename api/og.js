import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #CC0000 0%, #A30000 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '40px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '80px',
                      height: '80px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      fontWeight: 800,
                      color: '#CC0000',
                    },
                    children: 'M',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '42px',
                      fontWeight: 800,
                      color: '#ffffff',
                    },
                    children: 'MyBalanceNow',
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '52px',
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '900px',
              },
              children: 'Check Your Gift Card Balance Online',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '24px',
                color: 'rgba(255,255,255,0.8)',
                marginTop: '20px',
                textAlign: 'center',
              },
              children: 'Free, Fast & Secure — Visa & Mastercard Gift Cards',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '20px',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '40px',
              },
              children: 'mybalancetoday.org',
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
