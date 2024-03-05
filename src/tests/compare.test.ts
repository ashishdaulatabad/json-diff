import { CError, IterableSummary } from '../models/interface'
import compare from '../services/compare'
import { Result } from '../utils/result'
import { Field, DiffType } from '../models/interface'

test('Test compare empty object', async () => {
    const comparison: Result<IterableSummary, CError> = await compare.compare({}, {})
    expect(comparison.ok()).toBeTruthy()
    
    const validCompare: IterableSummary = comparison.get() as IterableSummary;
    expect(validCompare.isSame).toBeTruthy()
});

test('Test compare object with content', async () => {
    const comparison: Result<IterableSummary, CError> = await compare.compare({a: 'b', e: 'g'}, {c: 'd', e: 'f'})
    expect(comparison.ok()).toBeTruthy()
    
    const validCompare: IterableSummary = comparison.get() as IterableSummary;
    expect(validCompare.isSame).toBeFalsy()
    expect(validCompare.summary).toBeDefined()
    expect(validCompare.summary!.length).toEqual(3)

    expect(validCompare.summary!.map((a: Field) => a.fieldKey)).toEqual(expect.arrayContaining(['a', 'e', 'c']))
    expect(validCompare.summary!.map((a: Field) => a.diffResult)).toEqual(expect.arrayContaining([DiffType.LeftOnly, DiffType.Different, DiffType.RightOnly]))
});
