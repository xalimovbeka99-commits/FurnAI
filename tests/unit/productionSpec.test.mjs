import test from 'node:test';
import assert from 'node:assert';
import { generateProductionSpec, formatSpecAsPDF, formatSpecAsJSON, formatSpecAsXML } from '../../src/lib/productionSpec.js';

test('generateProductionSpec - wardrobe parameters', (t) => {
  const design = {
    type: 'wardrobe',
    color: 'oak',
    width: 2.0,
    height: 2.4,
    depth: 0.6,
    doorType: 'solid',
    handleStyle: 'gold',
    drawerRows: 2,
    ledLighting: 'warm',
    hangerRods: true,
  };

  const spec = generateProductionSpec(design);

  assert.ok(spec.id.startsWith('FURNI-'));
  assert.equal(spec.design.type, 'wardrobe');
  assert.equal(spec.design.color, 'oak');
  assert.equal(spec.design.dimensions.width, 200);
  assert.equal(spec.design.dimensions.height, 240);
  assert.equal(spec.design.dimensions.depth, 60);

  // Check hardware and costs are computed
  assert.ok(spec.costs.total > 0);
  assert.ok(spec.components.length > 0);
  
  // Verify drawer components exist
  const drawerFront = spec.components.find(c => c.name === 'Drawer Front');
  assert.ok(drawerFront);
  assert.equal(drawerFront.quantity, 6); // 2 rows * 3 sections/columns
});

test('generateProductionSpec - kitchen parameters', (t) => {
  const design = {
    type: 'kitchen',
    color: 'concrete',
    width: 3.0,
    height: 2.2,
    depth: 0.6,
  };

  const spec = generateProductionSpec(design);

  assert.equal(spec.design.type, 'kitchen');
  assert.equal(spec.design.color, 'concrete');
  assert.ok(spec.costs.total > 0);
  
  const countertop = spec.components.find(c => c.name === 'Countertop');
  assert.ok(countertop);
  assert.equal(countertop.width, 3000); // 3m in mm
});

test('generateProductionSpec - default values and fallback edge cases', (t) => {
  const design = {
    type: 'bed',
    color: 'nonexistent-color', // Should fallback to default material cost
    width: 1.8,
    height: 1.0,
    depth: 2.0,
  };

  const spec = generateProductionSpec(design);
  assert.equal(spec.design.type, 'bed');
  assert.ok(spec.costs.total > 0);
});

test('formatSpec - PDF, JSON, XML outputs', (t) => {
  const design = {
    type: 'cabinet',
    color: 'black',
    width: 1.2,
    height: 1.6,
    depth: 0.4,
  };

  const spec = generateProductionSpec(design);

  const pdf = formatSpecAsPDF(spec);
  assert.ok(pdf.includes('PRODUCTION SPECIFICATION CARD'));
  assert.ok(pdf.includes('FURNI-'));

  const json = formatSpecAsJSON(spec);
  assert.ok(json.startsWith('{'));

  const xml = formatSpecAsXML(spec);
  assert.ok(xml.includes('<?xml version="1.0"'));
  assert.ok(xml.includes('<FurnitureProject'));
});
