'use client';
import ServiceHeroContent from './ServiceHeroContent';

export default function InsuranceContent() {
  return (
    <ServiceHeroContent
      prefix="insurance"
      label="Insurance"
      defaults={{
        titleWhite: 'Aircraft ',
        titleBlue: 'Insurance',
        description: 'Our trusted partners at Titan Insurance specialize exclusively in high-end owner-flown piston and turbine aircraft, backed by decades of aviation insurance expertise. Get a tailored quote today.',
      }}
    />
  );
}
