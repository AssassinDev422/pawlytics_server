exports.assertEq = {
  string: (a, b) => {
    if (a === b) {
      return true;
    } else {
      throw new Error ("assertEq fail for "+ a + " and " +JSON.stringify(b))
    }
  }
}
