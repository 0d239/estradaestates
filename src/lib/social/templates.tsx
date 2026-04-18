import type { CSSProperties, ReactElement } from 'react';
import type { PostData } from './types';

const GOLD = '#C4A96E';
const GOLD_DARK = '#96733A';

const POST_TYPE_TAG: Record<PostData['type'], string> = {
  'new-listing': 'Just Listed',
  'open-house': 'Open House',
  'price-drop': 'Price Improved',
  'just-sold': 'Just Sold',
};

function formatPrice(n: number | null | undefined): string | null {
  if (n == null) return null;
  return `$${n.toLocaleString()}`;
}

function formatOpenHouse(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} ${date} · ${time}`;
}

function addressText(data: PostData): { primary: string; secondary: string } {
  const { listing } = data;
  return {
    primary: listing.address,
    secondary: [listing.city, listing.state].filter(Boolean).join(', '),
  };
}

function statsLine(data: PostData): string {
  const { listing } = data;
  const parts: string[] = [];
  if (listing.bedrooms != null) parts.push(`${listing.bedrooms} BD`);
  if (listing.bathrooms != null) parts.push(`${listing.bathrooms} BA`);
  if (listing.sqft != null) parts.push(`${listing.sqft.toLocaleString()} SF`);
  return parts.join('   ·   ');
}

interface PriceDisplay {
  main: string;
  struck?: string;
}

function priceDisplay(data: PostData): PriceDisplay {
  const { listing, type, extras } = data;

  if (type === 'just-sold' && extras.hidePrice) {
    return { main: 'SOLD' };
  }

  const main = formatPrice(listing.price) ?? '';

  if (type === 'price-drop' && extras.oldPrice) {
    return { main, struck: formatPrice(extras.oldPrice) ?? undefined };
  }

  return { main };
}

const LOGO = 'ESTRADA ESTATES';

// ===== CLASSIC BANNER =====

function ClassicLayout({ data }: { data: PostData }): ReactElement {
  const addr = addressText(data);
  const stats = statsLine(data);
  const price = priceDisplay(data);
  const tag = POST_TYPE_TAG[data.type];
  const openHouse = data.type === 'open-house' ? formatOpenHouse(data.extras.openHouseAt) : '';

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <img
        src={data.photoUrl}
        alt=""
        width={1080}
        height={1350}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
      {/* Bottom gradient overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.95) 100%)',
          display: 'flex',
        }}
      />
      {/* Top tag */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 36,
          backgroundColor: GOLD,
          color: '#000',
          padding: '10px 20px',
          fontSize: 22,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          fontFamily: 'system-ui',
          fontWeight: 700,
          display: 'flex',
        }}
      >
        {tag}
      </div>
      {/* Info band */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '50px 56px 40px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 44,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: 6,
            fontFamily: 'Libre Baskerville',
            display: 'flex',
          }}
        >
          {addr.primary}
        </div>
        <div
          style={{
            fontSize: 20,
            color: GOLD,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            marginBottom: 28,
            fontFamily: 'system-ui',
            display: 'flex',
          }}
        >
          {addr.secondary}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 18 }}>
          {price.struck ? (
            <div
              style={{
                fontSize: 32,
                color: '#888',
                textDecoration: 'line-through',
                fontFamily: 'Libre Baskerville',
                display: 'flex',
              }}
            >
              {price.struck}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 64,
              color: GOLD,
              fontFamily: 'Libre Baskerville',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            {price.main}
          </div>
        </div>
        {openHouse ? (
          <div
            style={{
              fontSize: 22,
              color: '#fff',
              letterSpacing: '3px',
              fontFamily: 'system-ui',
              fontWeight: 600,
              marginBottom: 14,
              display: 'flex',
            }}
          >
            {openHouse}
          </div>
        ) : null}
        {stats ? (
          <div
            style={{
              fontSize: 22,
              color: '#ccc',
              letterSpacing: '4px',
              fontFamily: 'system-ui',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {stats}
          </div>
        ) : null}
      </div>
      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          right: 40,
          fontSize: 16,
          color: GOLD,
          letterSpacing: '4px',
          fontFamily: 'system-ui',
          fontWeight: 600,
          display: 'flex',
        }}
      >
        {LOGO}
      </div>
    </div>
  );
}

// ===== MINIMAL STAMP =====

function MinimalLayout({ data }: { data: PostData }): ReactElement {
  const addr = addressText(data);
  const price = priceDisplay(data);
  const tag = POST_TYPE_TAG[data.type];
  const openHouse = data.type === 'open-house' ? formatOpenHouse(data.extras.openHouseAt) : '';

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <img
        src={data.photoUrl}
        alt=""
        width={1080}
        height={1350}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
      {/* Logo chip */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          right: 36,
          backgroundColor: 'rgba(0,0,0,0.55)',
          color: '#fff',
          padding: '10px 16px',
          fontSize: 18,
          letterSpacing: '4px',
          fontFamily: 'system-ui',
          fontWeight: 600,
          display: 'flex',
        }}
      >
        {LOGO}
      </div>
      {/* Info stamp */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 48,
          backgroundColor: 'rgba(0,0,0,0.88)',
          color: '#fff',
          padding: '28px 32px',
          borderLeft: `4px solid ${GOLD}`,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 640,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: GOLD,
            letterSpacing: '5px',
            textTransform: 'uppercase',
            marginBottom: 12,
            fontFamily: 'system-ui',
            fontWeight: 700,
            display: 'flex',
          }}
        >
          {tag}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
          {price.struck ? (
            <div
              style={{
                fontSize: 24,
                color: '#888',
                textDecoration: 'line-through',
                fontFamily: 'Libre Baskerville',
                display: 'flex',
              }}
            >
              {price.struck}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 54,
              fontFamily: 'Libre Baskerville',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            {price.main}
          </div>
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#ccc',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'system-ui',
            marginBottom: openHouse ? 12 : 0,
            display: 'flex',
          }}
        >
          {addr.primary}, {addr.secondary}
        </div>
        {openHouse ? (
          <div
            style={{
              fontSize: 18,
              color: GOLD,
              letterSpacing: '3px',
              fontFamily: 'system-ui',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {openHouse}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ===== EDITORIAL SPLIT =====

function EditorialLayout({ data }: { data: PostData }): ReactElement {
  const addr = addressText(data);
  const stats = statsLine(data);
  const price = priceDisplay(data);
  const tag = POST_TYPE_TAG[data.type];
  const openHouse = data.type === 'open-house' ? formatOpenHouse(data.extras.openHouseAt) : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* Photo block */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '62%',
        }}
      >
        <img
          src={data.photoUrl}
          alt=""
          width={1080}
          height={837}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        {/* Vertical ribbon tag */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            backgroundColor: GOLD,
            color: '#000',
            padding: '10px 22px',
            fontSize: 20,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            fontFamily: 'system-ui',
            fontWeight: 700,
            display: 'flex',
          }}
        >
          {tag}
        </div>
      </div>
      {/* Info panel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '52px 56px 48px',
          color: '#fff',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 14 }}>
          {price.struck ? (
            <div
              style={{
                fontSize: 34,
                color: '#888',
                textDecoration: 'line-through',
                fontFamily: 'Libre Baskerville',
                display: 'flex',
              }}
            >
              {price.struck}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 72,
              color: GOLD,
              fontFamily: 'Libre Baskerville',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            {price.main}
          </div>
        </div>
        <div
          style={{
            fontSize: 28,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            fontFamily: 'Libre Baskerville',
            marginBottom: 20,
            display: 'flex',
          }}
        >
          {addr.primary} · {addr.secondary}
        </div>
        <div
          style={{
            width: 48,
            height: 2,
            backgroundColor: GOLD,
            marginBottom: 20,
            display: 'flex',
          }}
        />
        {openHouse ? (
          <div
            style={{
              fontSize: 22,
              color: GOLD_DARK,
              letterSpacing: '5px',
              fontFamily: 'system-ui',
              fontWeight: 600,
              marginBottom: 14,
              display: 'flex',
            }}
          >
            {openHouse}
          </div>
        ) : null}
        {stats ? (
          <div
            style={{
              fontSize: 18,
              color: '#888',
              letterSpacing: '5px',
              textTransform: 'uppercase',
              fontFamily: 'system-ui',
              display: 'flex',
            }}
          >
            {stats}
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 56,
            fontSize: 16,
            color: GOLD,
            letterSpacing: '4px',
            fontFamily: 'system-ui',
            fontWeight: 600,
            display: 'flex',
          }}
        >
          {LOGO}
        </div>
      </div>
    </div>
  );
}

// ===== ERROR PLACEHOLDER =====

export function ErrorPlaceholder({ message }: { message: string }): ReactElement {
  const errorStyle: CSSProperties = {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui',
    fontSize: 32,
    padding: 60,
    textAlign: 'center',
  };
  return <div style={errorStyle}>{message}</div>;
}

// ===== DISPATCHER =====

export function renderLayout(data: PostData): ReactElement {
  switch (data.layout) {
    case 'classic':
      return <ClassicLayout data={data} />;
    case 'minimal':
      return <MinimalLayout data={data} />;
    case 'editorial':
      return <EditorialLayout data={data} />;
  }
}
