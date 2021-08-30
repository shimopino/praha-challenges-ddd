import { ValueObject } from 'src/domain/shared/ValueObject';

class DummyValueObject extends ValueObject<string, 'dummy'> {
  constructor(value: string) {
    super(value);
  }
}

describe('ValueObject の基底クラス', () => {
  describe('初期化した値を参照できる', () => {
    it('文字列 "Value Object" で初期化して、その値を抽出する', () => {
      // Given
      const expected = 'Value Object';

      // When
      const actual = new DummyValueObject(expected);

      // Then
      expect(actual.value).toBe(expected);
    });
  });

  describe('等価性を担保できる', () => {
    it('"Value Object"の値を使って、値オブジェクトを2つ生成した場合、両方のオブジェクトが同じ値だと判定する', () => {
      // Given
      const testData1 = 'Value Object';
      const testData2 = 'Value Object';

      // When
      const vo1 = new DummyValueObject(testData1);
      const vo2 = new DummyValueObject(testData2);

      // Then
      expect(vo1.equals(vo2)).toBeTruthy();
    });
  });
});
