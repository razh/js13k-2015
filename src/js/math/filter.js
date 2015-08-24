'use strict';

function Filter() {
  this.categoryBits = 1;
  this.maskBits = 0xFFFF;
  this.groupIndex = 0;
}

Filter.prototype.collides = function( filter ) {
  if ( this.groupIndex && this.groupIndex === filter.groupIndex ) {
    return this.groupIndex > 0;
  }

  return (
    ( this.maskBits & filter.categoryBits ) &&
    ( this.categoryBits & filter.maskBits )
  );
};

module.exports = Filter;
