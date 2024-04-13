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

test('Test compare empty arrays', async () => {
    const comparison: Result<IterableSummary, CError> = await compare.compare([], [])
    expect(comparison.ok()).toBeTruthy()
    
    const validCompare: IterableSummary = comparison.get() as IterableSummary;
    expect(validCompare.isSame).toBeTruthy()
});

test('Test compare same types', async () => {
    let comparison: Result<IterableSummary, CError> = await compare.compare(1222, 1222)
    expect(comparison.ok()).toBeTruthy()
    
    let validCompare: IterableSummary = comparison.get() as IterableSummary
    expect(validCompare.isSame).toBeTruthy()

    expect(validCompare.summary).toBeDefined()
    expect(validCompare.summary).toHaveLength(1)
    expect(validCompare.summary![0].diffResult).toEqual(DiffType.Same)
    expect(validCompare.summary![0].leftType).toEqual(validCompare.summary![0].rightType)
    expect(validCompare.summary![0].left).toEqual(validCompare.summary![0].right)

    comparison = await compare.compare("left", "right")
    expect(comparison.ok()).toBeTruthy()
    
    validCompare = comparison.get() as IterableSummary
    expect(validCompare.isSame).toBeFalsy()
    expect(validCompare.summary).toBeDefined()
    expect(validCompare.summary).toHaveLength(1)
    expect(validCompare.summary![0].diffResult).toEqual(DiffType.Different)
    expect(validCompare.summary![0].leftType).toEqual(validCompare.summary![0].rightType)
    expect(validCompare.summary![0].left).not.toEqual(validCompare.summary![0].right)

    comparison = await compare.compare(JSON.parse(JSON.stringify(true)), JSON.parse(JSON.stringify(false)))
    expect(comparison.ok()).toBeTruthy()
    
    validCompare = comparison.get() as IterableSummary
    expect(validCompare.isSame).toBeFalsy()
    expect(validCompare.summary).toBeDefined()
    expect(validCompare.summary).toHaveLength(1)
    expect(validCompare.summary![0].diffResult).toEqual(DiffType.Different)
    expect(validCompare.summary![0].leftType).toEqual(validCompare.summary![0].rightType)
    expect(validCompare.summary![0].left).not.toEqual(validCompare.summary![0].right)

    comparison = await compare.compare(12, false)
    expect(comparison.ok()).toBeTruthy()
    
    validCompare = comparison.get() as IterableSummary
    expect(validCompare.isSame).toBeFalsy()

    expect(validCompare.summary).toBeDefined()
    expect(validCompare.summary).toHaveLength(1)
    expect(validCompare.summary![0].diffResult).toEqual(DiffType.Different)
    expect(validCompare.summary![0].leftType).not.toEqual(validCompare.summary![0].rightType)
    expect(validCompare.summary![0].left).not.toEqual(validCompare.summary![0].right)
});

test('Test compare object with content', async () => {
    const comparison: Result<IterableSummary, CError> = await compare.compare(
        {a: 'b', e: 'g'}, 
        {c: 'd', e: 'f'}
    )
    expect(comparison.ok()).toBeTruthy()
    
    const validCompare: IterableSummary = comparison.get() as IterableSummary;
    expect(validCompare.isSame).toBeFalsy()
    expect(validCompare.summary).toBeDefined()
    expect(validCompare.summary!.length).toEqual(3)

    expect(validCompare.summary!.map((a: Field) => a.fieldKey))
        .toEqual(expect.arrayContaining(['a', 'e', 'c']))

    expect(validCompare.summary!.map((a: Field) => a.diffResult))
        .toEqual(expect.arrayContaining(
            [DiffType.LeftOnly, DiffType.Different, DiffType.RightOnly]
        ))
})
