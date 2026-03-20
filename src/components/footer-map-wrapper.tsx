"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/footer-map"), { ssr: false });

interface FooterMapWrapperProps {
  lat: number;
  lng: number;
  address?: string;
}

export default function FooterMapWrapper({ lat, lng, address }: FooterMapWrapperProps) {
  return <LeafletMap lat={lat} lng={lng} address={address} />;
}
