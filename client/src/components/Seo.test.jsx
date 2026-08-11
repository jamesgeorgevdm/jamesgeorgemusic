import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Seo from './Seo';

// Test 1 — simple props → output
// Seo just puts title / description / canonical into the document.
describe('Seo', () => {
  it('sets the page title from the title prop', () => {
    render(
      <Seo
        title="Contact | James George Music"
        description="Get in touch"
        path="/contact"
      />
    );

    // React 19 moves <title> into document.head for us
    expect(document.title).toBe('Contact | James George Music');
  });
});
